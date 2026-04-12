import EventEmitter from "@/Events/EventEmitter";
import IFireableEvents from "./IFireableEvents";
import IModelAttributes from "./IModelAttributes";
import IModelBootable from "./IModelBootable";

/**
 * Interface representing the base model structure and behavior.
 * Combines event handling, attribute management, and lifecycle methods.
 */
export interface IBaseModel extends IFireableEvents, IModelAttributes, IModelBootable {
    /**
     * Indicates whether the model supports event handling.
     */
    has_events: boolean;

    /**
     * An instance of EventEmitter used for managing and emitting events.
     */
    emitter: EventEmitter;

    /**
     * The name of the database table associated with the model.
     */
    table: string;

    /**
     * Registers an event listener for a specified event.
     *
     * @param {string} eventName - The name of the event to listen for.
     * @param {Function} callback - The function to be executed when the event is emitted.
     * @return {void} - Does not return a value.
     */
    on(eventName: string, callback: any): void;

    /**
     * Removes an event listener for the specified event.
     *
     * @param {string} eventName - The name of the event to stop listening to.
     * @param {Function} callback - The callback function to be removed from the event listener.
     * @return {void} No return value.
     */
    off(eventName: string, callback: any): void;

    /**
     * Fetches data asynchronously and processes it using the provided callback function.
     *
     * @param {Function} callback - The function to be executed once the data is fetched.
     *                              This function should accept the fetched data as its argument.
     * @return {Promise<void>} A promise that resolves after the callback function is executed.
     */
    fetch(callback: any): Promise<void>;


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
    update(callback: any): Promise<void>;

    /**
     * Deletes the current model and triggers relevant events.
     *
     * This method will fire the `DELETING` event before the deletion process
     * and the `DELETED` event after the process completes.
     *
     * @param {Function} callback A callback function to execute after the deletion process is completed.
     * @return {Promise<void>} A promise that resolves once the deletion process is completed and events are fired.
     */
    delete(callback: any): Promise<void>;

    /**
     * Permanently deletes the current model instance and triggers associated events.
     *
     * @param {Function} callback - A callback function to be executed during the force delete operation.
     * @return {Promise<void>} A promise that resolves when the delete operation is complete.
     */
    forceDelete(callback: any): Promise<void>;

    /**
     * Checks if the current attributes of an object have been modified compared to the original attributes.
     *
     * @return {boolean} Returns true if any attribute has been changed, otherwise false.
     */
    isDirty(): boolean;

    /**
     * Determines whether the current state or object meets the criteria for being "clean".
     *
     * @return {boolean} True if the state or object is considered clean; otherwise, false.
     */
    isClean(): boolean;

    /**
     * Converts the current object to a JSON representation.
     *
     * @return {Object} The JSON representation of the object's attributes.
     */
    toJSON(): Object;

    /**
     * Converts the object's attributes into an array representation.
     *
     * @return {Object} An array containing the attributes of the object.
     */
    toArray(): Object;

    /**
     * Converts the instance's attributes into a plain object.
     * @return {Object} The object's attributes as a plain object.
     */
    toObject(): Object;

    /**
     * Retrieves the original value of an attribute by its key.
     *
     * @param {string} key - The key of the attribute to retrieve.
     * @return {any} The original value of the specified attribute, or undefined if the key does not exist.
     */
    getOriginalAttribute(key: string): any;

    /**
     * Retrieves the original attributes of the object.
     *
     * @return {Object} The original attributes stored in the object.
     */
    getOriginalAttributes(): Object;
}