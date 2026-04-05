import Connection from "@/Database/Connection"

type ComparisonOperator = "=" | "!=" | ">" | ">=" | "<" | "<=" | "like" | "in" | "null"
type LogicalOperator = "and" | "or"
type OrderDirection = "asc" | "desc"

type WhereClause =
    | {
    type: "basic"
    key: string
    operator: Exclude<ComparisonOperator, "in" | "null">
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
        direction: OrderDirection
    }>
}

class QueryBuilder {
    protected connection: Connection
    protected tableName = ""
    protected wheres: WhereClause[] = []
    protected limitCount: number | null = null
    protected offsetCount: number | null = null
    protected orders: Array<{ key: string; direction: OrderDirection }> = []
    protected pendingData: Record<string, any> = {}

    constructor(connection: Connection) {
        this.connection = connection
    }

    public from(table: string): this {
        this.tableName = table
        return this
    }

    public where(key: string, operator: ComparisonOperator | any, value?: any): this {
        if (value === undefined) {
            value = operator
            operator = "="
        }

        if (operator === "in") {
            return this.whereIn(key, Array.isArray(value) ? value : [value])
        }

        if (operator === "null") {
            return this.whereNull(key)
        }

        this.wheres.push({
            type: "basic",
            key,
            operator: operator as Exclude<ComparisonOperator, "in" | "null">,
            value,
            boolean: "and",
        })

        return this
    }

    public orWhere(key: string, operator: ComparisonOperator | any, value?: any): this {
        if (value === undefined) {
            value = operator
            operator = "="
        }

        if (operator === "in") {
            return this.orWhereIn(key, Array.isArray(value) ? value : [value])
        }

        if (operator === "null") {
            return this.orWhereNull(key)
        }

        this.wheres.push({
            type: "basic",
            key,
            operator: operator as Exclude<ComparisonOperator, "in" | "null">,
            value,
            boolean: "or",
        })

        return this
    }

    public whereIn(key: string, values: any[]): this {
        this.wheres.push({ type: "in", key, values, boolean: "and" })
        return this
    }

    public orWhereIn(key: string, values: any[]): this {
        this.wheres.push({ type: "in", key, values, boolean: "or" })
        return this
    }

    public whereNull(key: string): this {
        this.wheres.push({ type: "null", key, not: false, boolean: "and" })
        return this
    }

    public whereNotNull(key: string): this {
        this.wheres.push({ type: "null", key, not: true, boolean: "and" })
        return this
    }

    public orWhereNull(key: string): this {
        this.wheres.push({ type: "null", key, not: false, boolean: "or" })
        return this
    }

    public orWhereNotNull(key: string): this {
        this.wheres.push({ type: "null", key, not: true, boolean: "or" })
        return this
    }

    public orderBy(key: string, direction: OrderDirection = "asc"): this {
        this.orders.push({ key, direction })
        return this
    }

    public limit(count: number): this {
        this.limitCount = count
        return this
    }

    public take(count: number): this {
        return this.limit(count)
    }

    public offset(count: number): this {
        this.offsetCount = count
        return this
    }

    public skip(count: number): this {
        return this.offset(count)
    }

    public async get(): Promise<any[]> {
        return this.connection.select(this.toSql(), [])
    }

    public async first(): Promise<any> {
        const rows = await this.limit(1).get()
        return rows[0] ?? null
    }

    public async insert(values: Record<string, any>): Promise<any> {
        this.pendingData = values
        return this.connection.insert(this.toSql(values), [values])
    }

    public async update(values: Record<string, any>): Promise<any> {
        this.pendingData = values
        return this.connection.update(this.toSql(values), [values])
    }

    public async delete(): Promise<any> {
        return this.connection.delete(this.toSql(), [])
    }

    public toSql(): string
    public toSql(values: Record<string, any>): string
    public toSql(values: Record<string, any> = {}): string {
        return JSON.stringify(this.toPayload(values))
    }

    protected toPayload(data: Record<string, any> = {}): QueryPayload {
        return {
            table: this.tableName,
            data: Object.keys(data).length ? data : this.pendingData,
            where: this.wheres,
            limit: this.limitCount ?? undefined,
            offset: this.offsetCount ?? undefined,
            orders: this.orders,
        }
    }
}

export default QueryBuilder