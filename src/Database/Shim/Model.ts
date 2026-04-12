import Connection from "@/Database/Connection"
import Str from "@/Support/Facades/Str";
import BaseModel from "@/Database/Shim/BaseModel";
import {MODEL_EVENTS} from "@/Events/Contracts";

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

class Model extends BaseModel {
    protected hidden: string[] = []
    protected appends: string[] = []

    constructor(attributes: ModelAttributes = {}) {
        super(attributes);
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
            .where(config.foreignPivotKey!, this.attributes[this.primaryKey])
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
}

export default Model