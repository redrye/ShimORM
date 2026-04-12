/**
 * Interface representing the attributes of a model.
 */
export default interface IModelAttributes {
    /**
     * The current attributes of the model.
     * This object contains the key-value pairs representing the model's state.
     */
    attributes: Object;

    /**
     * The original attributes of the model before any modifications.
     * This object is used to track changes and revert to the initial state if needed.
     */
    original_attributes: Object;
}