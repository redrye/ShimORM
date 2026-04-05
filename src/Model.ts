import Macroable from "@/Macroable"
import Connection from "@/Database/Connection"

type ModelAttributes = Record<string, any>

class Model extends Macroable {
    protected static connection: Connection | null = null
    protected static tableName: string | null = null

    protected attributes: ModelAttributes = {}

    constructor(attributes: ModelAttributes = {}) {
        super()
        this.fill(attributes)
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

    public static table(): string {
        return this.tableName ?? `${this.name.toLowerCase()}s`
    }

    public static query() {
        return this.getConnection().table(this.table())
    }

    public static async all(): Promise<any[]> {
        return this.query().get()
    }

    public static async find(id: any): Promise<any | null> {
        return this.query().where("id", id).first()
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

    public toJSON(): ModelAttributes {
        return { ...this.attributes }
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