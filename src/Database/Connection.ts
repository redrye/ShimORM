import Macroable from "@/Macroable/Macroable"
import QueryBuilder from "@/Database/Query/QueryBuilder"
import SchemaBuilder from "@/Database/Schema/SchemaBuilder"
import {derive} from "@traits-ts/core";

type ConnectionConfig = {
    database: string
    version?: number
}

type ComparisonOperator = "=" | "!=" | ">" | ">=" | "<" | "<=" | "like"
type LogicalOperator = "and" | "or"

type WhereClause =
    | {
    type: "basic"
    key: string
    operator: ComparisonOperator
    value: any
    boolean: LogicalOperator
}
    | {
    type: "in"
    key: string
    values: any[]
    boolean: LogicalOperator
}
    | {
    type: "null"
    key: string
    not: boolean
    boolean: LogicalOperator
}

type QueryPayload = {
    table: string
    data?: Record<string, any>
    where?: WhereClause[]
    limit?: number
    offset?: number
    orders?: Array<{
        key: string
        direction: "asc" | "desc"
    }>
}

type TableDefinition = {
    name: string
    keyPath?: string | string[]
    autoIncrement?: boolean
    indexes?: Array<{
        name: string
        keyPath: string | string[]
        options?: IDBIndexParameters
    }>
}

class Connection extends derive(Macroable) {
    protected database: string
    protected version: number
    protected idb: IDBDatabase | null = null
    protected connectionPromise: Promise<IDBDatabase> | null = null
    protected transactions = 0
    protected queryLog: Array<{
        query: string
        bindings: any[]
        time: number
    }> = []
    protected loggingQueries = false
    protected pretending = false

    constructor(config: ConnectionConfig) {
        super()
        this.database = config.database
        this.version = config.version ?? 1
    }

    public getDatabaseName() {
        return this.database
    }

    public getVersion() {
        return this.version
    }

    public async connect(): Promise<IDBDatabase> {
        if (this.idb) {
            return this.idb
        }

        if (!this.connectionPromise) {
            this.connectionPromise = new Promise((resolve, reject) => {
                const request = indexedDB.open(this.database, this.version)

                request.onupgradeneeded = () => {
                    this.idb = request.result
                }

                request.onsuccess = () => {
                    this.idb = request.result
                    resolve(request.result)
                }

                request.onerror = () => {
                    reject(request.error ?? new Error("Failed to open IndexedDB connection."))
                }
            })
        }

        return this.connectionPromise
    }

    public async disconnect(): Promise<void> {
        if (this.idb) {
            this.idb.close()
            this.idb = null
            this.connectionPromise = null
        }
    }

    public query(): QueryBuilder {
        return new QueryBuilder(this)
    }

    public table(table: string): QueryBuilder {
        return this.query().from(table)
    }

    public schema(): SchemaBuilder {
        return new SchemaBuilder(this)
    }

    public async createTable(definition: TableDefinition): Promise<void> {
        const nextVersion = this.version + 1

        await this.reopenWithUpgrade(nextVersion, (db) => {
            if (db.objectStoreNames.contains(definition.name)) {
                db.deleteObjectStore(definition.name)
            }

            const store = db.createObjectStore(definition.name, {
                keyPath: definition.keyPath,
                autoIncrement: definition.autoIncrement ?? false,
            })

            for (const index of definition.indexes ?? []) {
                store.createIndex(index.name, index.keyPath, index.options)
            }
        })

        this.version = nextVersion
    }

    public async dropTable(tableName: string): Promise<void> {
        const nextVersion = this.version + 1

        await this.reopenWithUpgrade(nextVersion, (db) => {
            if (db.objectStoreNames.contains(tableName)) {
                db.deleteObjectStore(tableName)
            }
        })

        this.version = nextVersion
    }

    public async hasTable(tableName: string): Promise<boolean> {
        const db = await this.connect()
        return db.objectStoreNames.contains(tableName)
    }

    public raw(value: string | number): any {
        return value
    }

    public async selectOne(query: string, bindings: any[] = [], useReadPdo = true): Promise<any> {
        const results = await this.select(query, bindings, useReadPdo)
        return Array.isArray(results) ? results[0] ?? null : results
    }

    public async scalar(query: string, bindings: any[] = [], useReadPdo = true): Promise<any> {
        const result = await this.selectOne(query, bindings, useReadPdo)
        if (!result || typeof result !== "object") {
            return result
        }

        const firstKey = Object.keys(result)[0]
        return firstKey ? result[firstKey] : null
    }

    public async select(query: string, bindings: any[] = [], useReadPdo = true, fetchUsing: any[] = []): Promise<any> {
        return this.run(query, bindings, async () => {
            const parsed = this.parseQuery(query, bindings)
            const db = await this.connect()
            const transaction = db.transaction(parsed.table, "readonly")
            const store = transaction.objectStore(parsed.table)

            const rows = await this.getAll(store)
            const filtered = this.applyWhere(rows, parsed.where)
            const ordered = this.applyOrder(filtered, parsed.orders)
            const offset = parsed.offset ?? 0

            return typeof parsed.limit === "number"
                ? ordered.slice(offset, offset + parsed.limit)
                : ordered.slice(offset)
        })
    }

    public async cursor(query: string, bindings: any[] = [], useReadPdo = true, fetchUsing: any[] = []): Promise<any> {
        return this.select(query, bindings, useReadPdo, fetchUsing)
    }

    public async insert(query: string, bindings: any[] = []): Promise<any> {
        return this.run(query, bindings, async () => {
            const parsed = this.parseQuery(query, bindings)
            const db = await this.connect()
            const transaction = db.transaction(parsed.table, "readwrite")
            const store = transaction.objectStore(parsed.table)

            const data = parsed.data ?? {}
            return this.promisifyRequest(store.add(data))
        })
    }

    public async update(query: string, bindings: any[] = []): Promise<any> {
        return this.run(query, bindings, async () => {
            const parsed = this.parseQuery(query, bindings)
            const db = await this.connect()
            const transaction = db.transaction(parsed.table, "readwrite")
            const store = transaction.objectStore(parsed.table)

            const rows = await this.getAll(store)
            const matches = this.applyWhere(rows, parsed.where)

            let affected = 0
            for (const row of matches) {
                const updated = { ...row, ...(parsed.data ?? {}) }
                await this.promisifyRequest(store.put(updated))
                affected++
            }

            return affected
        })
    }

    public async delete(query: string, bindings: any[] = []): Promise<any> {
        return this.run(query, bindings, async () => {
            const parsed = this.parseQuery(query, bindings)
            const db = await this.connect()
            const transaction = db.transaction(parsed.table, "readwrite")
            const store = transaction.objectStore(parsed.table)

            const rows = await this.getAll(store)
            const matches = this.applyWhere(rows, parsed.where)

            let affected = 0
            for (const row of matches) {
                const key = this.getPrimaryKey(store, row)
                if (key !== undefined) {
                    await this.promisifyRequest(store.delete(key))
                    affected++
                }
            }

            return affected
        })
    }

    public async statement(query: string, bindings: any[] = []): Promise<any> {
        return this.run(query, bindings, async () => true)
    }

    public async affectingStatement(query: string, bindings: any[] = []): Promise<any> {
        return this.run(query, bindings, async () => 0)
    }

    public unprepared(query: string) {
        return query
    }

    public prepareBindings(bindings: any[]) {
        return bindings
    }

    public async transaction(callback: (...args: any[]) => any, attempts = 1): Promise<any> {
        this.transactions++
        try {
            const result = await callback()
            this.transactions = Math.max(0, this.transactions - 1)
            return result
        } catch (error) {
            this.transactions = Math.max(0, this.transactions - 1)
            throw error
        }
    }

    public beginTransaction() {
        this.transactions++
    }

    public commit() {
        this.transactions = Math.max(0, this.transactions - 1)
    }

    public rollBack() {
        this.transactions = Math.max(0, this.transactions - 1)
    }

    public transactionLevel() {
        return this.transactions
    }

    public async pretend(callback: (...args: any[]) => any): Promise<any> {
        this.pretending = true
        try {
            return await callback()
        } finally {
            this.pretending = false
        }
    }

    public enableQueryLog(): void {
        this.loggingQueries = true
    }

    public disableQueryLog(): void {
        this.loggingQueries = false
    }

    public getQueryLog() {
        return this.queryLog
    }

    public flushQueryLog(): void {
        this.queryLog = []
    }

    protected async run<T>(query: string, bindings: any[], callback: () => Promise<T> | T): Promise<T> {
        const start = performance.now()

        if (this.pretending) {
            return callback()
        }

        try {
            return await callback()
        } finally {
            if (this.loggingQueries) {
                this.queryLog.push({
                    query,
                    bindings: this.prepareBindings(bindings),
                    time: performance.now() - start,
                })
            }
        }
    }

    protected parseQuery(query: string, bindings: any[]): QueryPayload {
        const parsed = query.trim()

        try {
            const json = JSON.parse(parsed) as QueryPayload
            return {
                table: json.table,
                data: json.data ?? bindings?.[0] ?? {},
                where: json.where ?? [],
                limit: json.limit,
                offset: json.offset,
                orders: json.orders ?? [],
            }
        } catch {
            return {
                table: parsed,
                data: bindings?.[0] ?? {},
                where: [],
                orders: [],
            }
        }
    }

    protected async getAll(store: IDBObjectStore): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const request = store.getAll()

            request.onsuccess = () => resolve(request.result ?? [])
            request.onerror = () => reject(request.error ?? new Error("Failed to read records from IndexedDB."))
        })
    }

    protected async promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."))
        })
    }

    protected applyWhere(rows: any[], where: WhereClause[] = []): any[] {
        if (!where.length) {
            return rows
        }

        return rows.filter((row) => {
            let result = true

            for (let i = 0; i < where.length; i++) {
                const clause = where[i]
                const match = this.matchesClause(row?.[clause.key], clause)

                if (i === 0) {
                    result = match
                    continue
                }

                result = clause.boolean === "and" ? result && match : result || match
            }

            return result
        })
    }

    protected matchesClause(actual: any, clause: WhereClause): boolean {
        switch (clause.type) {
            case "basic":
                return this.compare(actual, clause.operator, clause.value)
            case "in":
                return clause.values.includes(actual)
            case "null":
                return clause.not ? actual !== null && actual !== undefined : actual === null || actual === undefined
        }
    }

    protected compare(actual: any, operator: ComparisonOperator, expected: any): boolean {
        switch (operator) {
            case "=":
                return actual === expected
            case "!=":
                return actual !== expected
            case ">":
                return actual > expected
            case ">=":
                return actual >= expected
            case "<":
                return actual < expected
            case "<=":
                return actual <= expected
            case "like": {
                const value = String(actual ?? "")
                const pattern = String(expected ?? "")
                    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
                    .replace(/%/g, ".*")
                return new RegExp(`^${pattern}$`, "i").test(value)
            }
        }
    }

    protected applyOrder(rows: any[], orders: Array<{ key: string; direction: "asc" | "desc" }> = []): any[] {
        if (!orders.length) {
            return rows
        }

        return [...rows].sort((a, b) => {
            for (const order of orders) {
                const av = a?.[order.key]
                const bv = b?.[order.key]

                if (av === bv) {
                    continue
                }

                const comparison = av > bv ? 1 : -1
                return order.direction === "asc" ? comparison : -comparison
            }

            return 0
        })
    }

    protected getPrimaryKey(store: IDBObjectStore, row: any): IDBValidKey | undefined {
        const keyPath = store.keyPath

        if (typeof keyPath === "string") {
            return row?.[keyPath]
        }

        if (Array.isArray(keyPath)) {
            return keyPath.map((key) => row?.[key])
        }

        return undefined
    }

    protected async reopenWithUpgrade(version: number, upgradeCallback: (db: IDBDatabase) => void): Promise<void> {
        await this.disconnect()

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.database, version)

            request.onupgradeneeded = () => {
                try {
                    upgradeCallback(request.result)
                } catch (error) {
                    reject(error)
                }
            }

            request.onsuccess = () => {
                this.idb = request.result
                this.connectionPromise = Promise.resolve(request.result)
                resolve()
            }

            request.onerror = () => {
                reject(request.error ?? new Error("Failed to upgrade IndexedDB schema."))
            }
        })
    }
}

export default Connection