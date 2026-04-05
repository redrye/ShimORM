import Macroable from "@/Macroable"
import Connection from "@/Database/Connection"

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

class SchemaBuilder extends Macroable {
    protected connection: Connection

    constructor(connection: Connection) {
        super()
        this.connection = connection
    }

    public async createTable(definition: TableDefinition): Promise<void> {
        await this.connection.createTable(definition)
    }

    public async dropTable(tableName: string): Promise<void> {
        await this.connection.dropTable(tableName)
    }

    public async hasTable(tableName: string): Promise<boolean> {
        return this.connection.hasTable(tableName)
    }

    public async create(definitions: TableDefinition | TableDefinition[]): Promise<void> {
        const list = Array.isArray(definitions) ? definitions : [definitions]

        for (const definition of list) {
            await this.createTable(definition)
        }
    }

    public async drop(tableName: string): Promise<void> {
        await this.dropTable(tableName)
    }
}

export default SchemaBuilder