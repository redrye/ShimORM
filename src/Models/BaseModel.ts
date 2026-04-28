import EventEmitter from "@/Events/EventEmitter";
import {MODEL_EVENTS} from "@/Events/Contracts";
import Str from "@/Support/Facades/Str";
import EventServiceProvider from "@/Providers/EventServiceProvider";
import {IBaseModel} from "@/Database/Shim/Contracts/IBaseModel";
import QueryBuilder from "@/Database/Query/QueryBuilder";
import Connection from "@/Database/Connection"
import Model from "@/Database/Shim/Model";
import model from "@/Database/Shim/Model";

/**
 * The BaseModel.ts file defines a foundational class for models in the workspace.
 * It provides essential properties and mechanisms for managing model attributes, events, and state.
 *
 * Usage
 * This base model can be extended by other models to inherit its properties and event-handling capabilities.
 * It provides a structure for managing attributes and tracking their changes, as well as emitting events when necessary.
 *
 * Notes
 * - The BaseModel is designed to be generic and flexible, allowing it to be adapted to various use cases.
 * - Additional methods and logic can be implemented to extend its functionality as needed.
 */

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

class BaseModel implements IBaseModel {

    protected primaryKey = 'id';
    protected keyType = 'int';

    protected static connection: Connection | null = null
    protected static tableName: string | null = null
    protected relationships: Map<string, RelationshipConfig> = new Map()
    protected loadedRelations: Map<string, any> = new Map()
    protected static normalizeName(target): string {
        return Str.snake(target.name)
    }

    protected static defaultForeignKey(target): string {
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
    /**
     * Indicates whether the model supports event handling. Default is true.
     */
    has_events = true;

    /**
     * An instance of EventEmitter used for managing and emitting events.
     */
    emitter: EventEmitter = new EventEmitter();
    /**
     * Represents whether the model has been initialized or "booted". Default is false.
     */
    booted = false;
    /**
     * Stores the name of the database table associated with the model.
     * This property is used as a part of ajax request for the endpoints
     * Default is an empty string.
     */
    table: any = '';
    /**
     * Holds the current state of the model's attributes.
     */
    attributes = {}
    /**
     * Stores the original state of the model's attributes, useful for tracking changes.
     */
    original_attributes = {}
    constructor(attributes = {}) {
        this.bootAttributes(attributes)
        this.bootIfNotBooted()
    }

    forceDelete(callback: any): Promise<void> {
        throw new Error("Method not implemented.");
    }


    /**
     * Initializes and sets the attributes for an object. If the `attributes` key exists within the passed object,
     * its values are deeply assigned to the `attributes` and `original_attributes` properties.
     * For other keys, their values are directly assigned to the respective properties.
     *
     * @param {Object} attributes - The object containing attributes to be set. Can include nested `attributes` key.
     * @return {void} This method does not return a value.
     */
    bootAttributes(attributes) {

        Object.keys(attributes).forEach(key => {
            if(key == 'attributes') {
                this.bootAttributes(attributes[key])
            } else {
                this.setAttributeFromBoot(key, attributes[key])
            }

        })
    }

    /**
     * Sets an attribute in the `attributes` and `original_attributes` objects
     * and defines a corresponding setter and getter for the specified key.
     *
     * @param {string} key - The key of the attribute to set.
     * @param {*} value - The value of the attribute to set.
     * @return {void} Does not return a value.
     */
    setAttributeFromBoot(key, value) {
        this.attributes[key] = value;
        this.original_attributes[key] = value;
        this.defineSetterAndGetter(key)
    }

    /**
     * Dynamically defines a getter and setter for a specified attribute on the object.
     * Creates a property on the object with a custom getter and setter functionality
     * that retrieves and updates the value of the specified attribute from the object's
     * `attributes` property.
     *
     * @function
     * @param {string} attribute - The name of the attribute for which to define
     *                             the getter and setter.
     */

    protected defineSetterAndGetter = (attribute) => {
        Object.defineProperty(this, attribute, {
            get: () => {
                return this.attributes[attribute];
            },
            set: (value) => {
                this.attributes[attribute] = value;
            }
        })
    }

    /**
     * Ensures that the system or application is initialized by checking its state and invoking the boot process if it has not already been executed.
     *
     * @return {void} Does not return a value.
     */
    bootIfNotBooted(): void {
        if(!this.booted) {
            this.boot()
        }
    }

    /**
     * Initializes and prepares the object for use by performing the necessary setup.
     *
     * This method performs the following:
     * - Calls the `bootTable` method to initialize table-related configurations.
     * - Calls the `bootEvents` method to set up necessary event handlers.
     * - Fires the `MODEL_EVENTS.BOOTING` event to indicate that the booting process has started.
     * - Sets the `booted` property to true to signify that the booting process has completed.
     * - Fires the `MODEL_EVENTS.BOOTED` event to indicate that the object is fully initialized.
     *
     * @return {void} Does not return any value.
     */

    boot(): void {
        this.bootTable()
        this.bootEvents()
        this.fireEvent(MODEL_EVENTS.BOOTING)
        this.booted = true;
        this.fireEvent(MODEL_EVENTS.BOOTED)
    }

    /**
     * Initializes and configures event observers for the current instance if events are enabled.
     *
     * @return {void} This method does not return any value.
     */

    bootEvents(): void {
        if(this.has_events) {
            this.emitter = new EventEmitter();
            var eventServiceProvider = new EventServiceProvider()
            var className = Str.pascal(this.table)
            console.log(className)
            console.log(eventServiceProvider)
            console.log('test')

            if(className in eventServiceProvider.eventObservers) {
                let observers = eventServiceProvider.eventObservers[className];
                observers.forEach(observer => {
                    Object.keys(observer).forEach(key => {
                        this.emitter.on(key, observer[key](this));
                    })
                })
            }
        }
    }

    /**
     * Sets the table name for the current instance in a snake_case format.
     * If the table name is not already defined, it defaults to using the snake_case version of the class name.
     * If the table name is already defined, it converts the existing value to snake_case format.
     *
     * @return {void} No return value.
     */
    bootTable(): void {
        if(this.table == '') {
            this.table = Str.snake(this.constructor.name)
        } else {
            this.table = Str.snake(this.table)
        }
    }

    /**
     * Triggers an event using the internal event emitter and passes the current instance as an argument.
     *
     * @param {string} event - The name of the event to be fired.
     * @return {void} This method does not return any value.
     */

    fireEvent(event: string): void {
        this.emitter.emit(event, this)
    }

    /**
     * Registers an event listener for a specified event.
     *
     * @param {string} eventName - The name of the event to listen for.
     * @param {Function} callback - The function to be executed when the event is emitted.
     * @return {void} - Does not return a value.
     */
    on(eventName, callback) {
        this.emitter.on(eventName, callback)
    }

    /**
     * Removes an event listener for the specified event.
     *
     * @param {string} eventName - The name of the event to stop listening to.
     * @param {Function} callback - The callback function to be removed from the event listener.
     * @return {void} No return value.
     */
    off(eventName, callback) {

        this.emitter.off(eventName, callback)

    }

    /**
     * Fetches data asynchronously and processes it using the provided callback function.
     *
     * @param {Function} callback - The function to be executed once the data is fetched.
     *                              This function should accept the fetched data as its argument.
     * @return {Promise<void>} A promise that resolves after the callback function is executed.
     */

    async fetch(callback) {

    }
    /**
     * Retrieves all records or data entries from the associated data source.
     *
     * @return {Promise<Array>} A promise that resolves with an array of all retrieved records.
     */
    static async fetchAll() {

    }

    /**
     * Creates multiple records in the data source.
     *
     * This method is designed to handle the creation of multiple items at once.
     * It ensures batch insertion and can improve performance over multiple individual insertions.
     *
     * @return {Promise<Array>} A promise that resolves with an array of the created records.
     */
    static async createMany() {

    }

    /**
     * Creates a new resource or entry based on the implementation within the method.
     *
     * @return {Promise<any>} A promise that resolves to the result of the creation process. The exact type of the return value depends on the implementation.
     */
    async create() {

    }

    /**
     * Creates a new resource or updates an existing one based on the provided input.
     * This method handles both creation and updating logic, ensuring the resource state aligns with the input data.
     *
     * @return {Promise<Object>} A promise that resolves to the created or updated resource object.
     */
    async createOrUpdate() {

    }

    /**
     * Creates or updates multiple records in the database.
     * This method will either create new records if they do not exist,
     * or update existing records with the provided data.
     *
     * @return {Promise<Array|Error>} A promise that resolves to an array of created or updated records,
     * or rejects with an error if the operation fails.
     */
    async createOrUpdateMany() {

    }

    async updateMany() {

    }
    /**
     * Saves the current state of the model and triggers corresponding events.
     *
     * @param {Function} callback - A function to execute after the save process is completed.
     * @return {Promise<void>} A promise that resolves once the save operation is complete.
     */
    
    public async save(callback = undefined): Promise<this> {
        this.fireEvent(MODEL_EVENTS.SAVING)
        const ctor = this.constructor as typeof Model

        if (this.getKeyName() === undefined || this.getKeyName()) {
            const insertedId = await ctor.query().insert(this.attributes)

            if (insertedId !== undefined && insertedId !== null) {
                this.setKeyName(insertedId)
            }
            this.fireEvent(MODEL_EVENTS.SAVED)
            callback?.(this)
        }

        await ctor.query().where(this.getKeyName(), this.attributes[this.getKeyName()]).update(this.attributes)
        this.fireEvent(MODEL_EVENTS.SAVED)
        return this
    }
    /**
     * Updates the model and triggers related events.
     *
     * This method will first trigger the "UPDATING" event, allowing any pre-update
     * actions to be handled. After the update process completes, the "UPDATED"
     * event is triggered. A callback function can be provided for additional
     * custom operations upon update.
     *
     * @param {Function} callback - A function to execute after the model is updated. This argument is optional.
     * @return {Promise<void>} A promise that resolves when the update process is complete.
     */
    async update(callback) {
        this.fireEvent(MODEL_EVENTS.UPDATING)

        this.fireEvent(MODEL_EVENTS.UPDATED)
    }


    /**
     * Checks if the current attributes of an object have been modified compared to the original attributes.
     *
     * @return {boolean} Returns true if any attribute has been changed, otherwise false.
     */
    isDirty(): boolean {
        // @ts-ignore
        Object.keys(this.attributes).forEach(key => {
            if(this.attributes[key] != this.original_attributes[key]) {
                return true;
            }
        })
        return false;
    }

    /**
     * Determines whether the current state or object meets the criteria for being "clean".
     *
     * @return {boolean} True if the state or object is considered clean; otherwise, false.
     */
    isClean() {
        return this.isDirty() == false;
    }

    /**
     * Converts the current object to a JSON representation.
     *
     * @return {Object} The JSON representation of the object's attributes.
     */
    public toJSON(): any {
        const json = {...this.attributes}

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


    /**
     * Converts the object's attributes into an array representation.
     *
     * @return {Array} An array containing the attributes of the object.
     */
    toArray() {
        return this.attributes;
    }

    /**
     * Converts the instance's attributes into a plain object.
     * @return {Object} The object's attributes as a plain object.
     */
    toObject() {
        return this.attributes;
    }

    /**
     * Retrieves the original value of an attribute by its key.
     *
     * @param {string} key - The key of the attribute to retrieve.
     * @return {*} The original value of the specified attribute, or undefined if the key does not exist.
     */
    getOriginalAttribute(key) {
        return this.original_attributes[key];
    }

    /**
     * Retrieves the original attributes of the object.
     *
     * @return {Object} The original attributes stored in the object.
     */
    getOriginalAttributes() {
        return this.original_attributes;
    }


    static where(field: string, operatorOrValue: any, value?: any): QueryBuilder {
        return this.query().where(field, operatorOrValue, value);
    }

    public static async all(): Promise<any[]> {
        return this.query().get()
    }


    public static query() {
        return this.getConnection().table(this.getTable())
    }

    /**
     * Deletes the current model and triggers relevant events.
     *
     * This method will fire the `DELETING` event before the deletion process
     * and the `DELETED` event after the process completes.
     *
     * @param {Function} callback A callback function to execute after the deletion process is completed.
     * @return {Promise<void>} A promise that resolves once the deletion process is completed and events are fired.
     */
    public async delete(): Promise<any> {
        this.fireEvent(MODEL_EVENTS.DELETING)
        const ctor = this.constructor as typeof Model

        if (this.attributes[this.getKeyName()] === undefined || this.attributes[this.getKeyName()] === null) {
            return false
        }
        ctor.query().where(this.getKeyName(), this.attributes[this.getKeyName()]).delete()
        this.fireEvent(MODEL_EVENTS.DELETED)
    }
    public getKeyName() {
        return this.primaryKey;
    }
    public setKeyName(key) {
        return this.primaryKey = key;
    }


}

export default BaseModel;