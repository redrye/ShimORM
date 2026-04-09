import Connection from "@/Database/Connection"
import Str from "@/Support/Facades/Str";

type ModelAttributes = Record<string, any>
type RelationshipType = "hasOne" | "hasMany" | "belongsTo" | "belongsToMany"

interface RelationshipConfig {
    type: RelationshipType
    model: typeof Model
    foreignKey?: string
    localKey?: string
    pivotTable?: string
    foreignPivotKey?: string
    relatedPivotKey?: string
}

class Model {
    protected static connection: Connection | null = null
    protected static tableName: string | null = null

    protected attributes: ModelAttributes = {}
    protected hidden: string[] = []
    protected appends: string[] = []
    protected relationships: Map<string, RelationshipConfig> = new Map()
    protected loadedRelations: Map<string, any> = new Map()

    constructor(attributes: ModelAttributes = {}) {
        this.fill(attributes)
    }

    private static normalizeName(target: typeof Model): string {
        return Str.snake(target.name)
    }

    private static defaultForeignKey(target: typeof Model): string {
        return `${this.normalizeName(target)}_id`
    }

    public static setConnection(connection: Connection): void {
        this.connection = connection
    }

    public static getConnection(): Connection {
        if (!this.connection) {
            throw new Error(`No database connection has been set for ${this.name}.`)
        }

        return this.connection
    }

    public static setTable(table: string): void {
        this.tableName = table
    }

    public static getTable(): string {
        return this.tableName ?? `${Str.snake(Str.pluralStudly(this.name))}`
    }

    public static query() {
        return this.getConnection().table(this.getTable())
    }

    public static async all(): Promise<any[]> {
        return this.query().get()
    }

    public static async find(id: any): Promise<any | null> {
        return this.query().where("id", id).first()
    }

    public static with(...relations: string[]) {
        return {
            get: async () => {
                const items = await this.all()
                for (const item of items) {
                    for (const relation of relations) {
                        await item.getRelation(relation)
                    }
                }
                return items
            },
            find: async (id: any) => {
                const item = await this.find(id)
                if (item) {
                    for (const relation of relations) {
                        await item.getRelation(relation)
                    }
                }
                return item
            }
        }
    }

    public static async create(attributes: ModelAttributes): Promise<any> {
        const instance = new this(attributes)
        await instance.save()
        return instance
    }

    public fill(attributes: ModelAttributes): this {
        this.attributes = {
            ...this.attributes,
            ...attributes,
        }

        return this
    }

    public get(key: string): any {
        return this.attributes[key]
    }

    public set(key: string, value: any): this {
        this.attributes[key] = value
        return this
    }

    protected hasOne(model: typeof Model, foreignKey?: string, localKey: string = "id"): this {
        const relationName = Model.normalizeName(model)

        this.relationships.set(relationName, {
            type: "hasOne",
            model,
            foreignKey: foreignKey ?? Model.defaultForeignKey(this.constructor as typeof Model),
            localKey
        })

        return this
    }

    protected hasMany(model: typeof Model, foreignKey?: string, localKey: string = "id"): this {
        const relationName = `${Model.normalizeName(model)}s`

        this.relationships.set(relationName, {
            type: "hasMany",
            model,
            foreignKey: foreignKey ?? Model.defaultForeignKey(this.constructor as typeof Model),
            localKey
        })

        return this
    }

    protected belongsTo(model: typeof Model, foreignKey?: string, localKey: string = "id"): this {
        const relationName = Model.normalizeName(model)

        this.relationships.set(relationName, {
            type: "belongsTo",
            model,
            foreignKey: foreignKey ?? Model.defaultForeignKey(model),
            localKey
        })

        return this
    }

    protected belongsToMany(
        model: typeof Model,
        pivotTable?: string,
        foreignPivotKey?: string,
        relatedPivotKey?: string,
        localKey: string = "id",
        relatedKey: string = "id"
    ): this {
        const relationName = `${Model.normalizeName(model)}s`
        const ctor = this.constructor as typeof Model

        this.relationships.set(relationName, {
            type: "belongsToMany",
            model,
            pivotTable: pivotTable ?? [ctor.getTable(), model.getTable()].sort().join("_"),
            foreignPivotKey: foreignPivotKey ?? `${Model.normalizeName(ctor)}_id`,
            relatedPivotKey: relatedPivotKey ?? `${Model.normalizeName(model)}_id`,
            localKey,
        })

        return this
    }

    private async loadHasOne(config: RelationshipConfig): Promise<any> {
        return config.model
            .query()
            .where(config.foreignKey!, this.attributes[config.localKey!])
            .first()
    }

    private async loadHasMany(config: RelationshipConfig): Promise<any> {
        return config.model
            .query()
            .where(config.foreignKey!, this.attributes[config.localKey!])
            .get()
    }

    private async loadBelongsTo(config: RelationshipConfig): Promise<any> {
        return config.model
            .query()
            .where(config.localKey!, this.attributes[config.foreignKey!])
            .first()
    }

    private async loadBelongsToMany(config: RelationshipConfig): Promise<any[]> {
        const ctor = this.constructor as typeof Model

        const pivotRecords = await ctor
            .getConnection()
            .table(config.pivotTable!)
            .where(config.foreignPivotKey!, this.attributes.id)
            .get()

        const relatedIds = pivotRecords.map((record: any) => record[config.relatedPivotKey!])

        if (relatedIds.length === 0) {
            return []
        }

        return config.model
            .query()
            .whereIn("id", relatedIds)
            .get()
    }

    public async getRelation(name: string): Promise<any> {
        if (this.loadedRelations.has(name)) {
            return this.loadedRelations.get(name)
        }

        const config = this.relationships.get(name)
        if (!config) {
            throw new Error(`Relationship '${name}' is not defined on ${this.constructor.name}`)
        }

        let result: any

        switch (config.type) {
            case "hasOne":
                result = await this.loadHasOne(config)
                break
            case "hasMany":
                result = await this.loadHasMany(config)
                break
            case "belongsTo":
                result = await this.loadBelongsTo(config)
                break
            case "belongsToMany":
                result = await this.loadBelongsToMany(config)
                break
        }

        this.loadedRelations.set(name, result)
        return result
    }

    public toJSON(): ModelAttributes {
        const json: ModelAttributes = {...this.attributes}

        this.loadedRelations.forEach((value, key) => {
            if (Array.isArray(value)) {
                json[key] = value.map(item => item.toJSON ? item.toJSON() : item)
            } else if (value && typeof value.toJSON === "function") {
                json[key] = value.toJSON()
            } else {
                json[key] = value
            }
        })

        return json
    }

    public async save(): Promise<this> {
        const ctor = this.constructor as typeof Model

        if (this.attributes.id === undefined || this.attributes.id === null) {
            const insertedId = await ctor.query().insert(this.attributes)

            if (insertedId !== undefined && insertedId !== null) {
                this.attributes.id = insertedId
            }

            return this
        }

        await ctor.query().where("id", this.attributes.id).update(this.attributes)
        return this
    }

    public async delete(): Promise<any> {
        const ctor = this.constructor as typeof Model

        if (this.attributes.id === undefined || this.attributes.id === null) {
            return false
        }

        return ctor.query().where("id", this.attributes.id).delete()
    }
}

export default Model