export default interface ConnectionInterface {
    table(table: string): any

    raw(value: string | number): any

    selectOne(query: string, bindings?: any[], useReadPdo?: boolean): any

    scalar(query: string, bindings?: any[], useReadPdo?: boolean): any

    select(query: string, bindings?: any[], useReadPdo?: boolean, fetchUsing?: any[]): any

    cursor(query: string, bindings?: any[], useReadPdo?: boolean, fetchUsing?: any[]): any

    insert(query: string, bindings?: any[]): any

    update(query: string, bindings?: any[]): any

    delete(query: string, bindings?: any[]): any

    statement(query: string, bindings?: any[]): any

    affectingStatement(query: string, bindings?: any[]): any

    unprepared(query: string): any

    prepareBindings(bindings: any[]): any

    transaction(callback: (...args: any[]) => any, attempts?: number): any

    beginTransaction(): any

    commit(): any

    rollBack(): any

    transactionLevel(): any

    pretend(callback: (...args: any[]) => any): any

    getDatabaseName(): any
}