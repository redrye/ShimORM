/**
 * Interface representing a bootable model.
 * Provides methods to initialize and manage attributes for the model.
 */
export default interface IModelBootable {
    /**
     * Indicates whether the model has been booted.
     * This property is used to track the initialization state of the model.
     */
    booted: boolean;

    /**
     * Boots the model if it has not been booted already.
     * Ensures that the model is initialized and ready for use.
     * This method is typically called before performing operations that require the model to be initialized.
     */
    bootIfNotBooted(): void;

    /**
     * Initializes and sets the attributes for an object.
     * If the `attributes` key exists within the passed object,
     * its values are deeply assigned to the `attributes` and `original_attributes` properties.
     * For other keys, their values are directly assigned to the respective properties.
     *
     * @param {Object} attributes - The object containing attributes to be set. Can include nested `attributes` key.
     * This allows for flexible initialization of the model's state.
     */
    bootAttributes(attributes: Object): void;

    /**
     * Sets an attribute in the `attributes` and `original_attributes` objects.
     * Additionally, it defines a corresponding setter and getter for the specified key,
     * enabling dynamic access and modification of the attribute.
     *
     * @param {string} key - The key of the attribute to set.
     * This represents the name of the property to be added or updated.
     * @param {*} value - The value of the attribute to set.
     * This can be of any type, depending on the model's requirements.
     */
    setAttributeFromBoot(key: string, value: any): void;

    /**
     * Ensures that the system or application is initialized by checking its state
     * and invoking the boot process if it has not already been executed.
     * This method is critical for preparing the model for use in the application.
     *
     * @return {void} Does not return a value.
     */
    boot(): void;
}