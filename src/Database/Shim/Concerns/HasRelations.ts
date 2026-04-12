import {trait} from "@traits-ts/core";
import Model from "@/Database/Shim/Model";

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
const HasRelations = trait((base) => class extends base {
    protected relationships: Map<string, RelationshipConfig> = new Map()
    protected loadedRelations: Map<string, any> = new Map()

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
});

export default HasRelations