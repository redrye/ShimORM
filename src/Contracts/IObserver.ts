/**
 * Interface representing an observer for model lifecycle events.
 * Implement this interface to handle specific events during the lifecycle of a model.
 */
interface IObserver {
    /**
     * Triggered before the model is booted.
     * @param model - The model instance being booted.
     */
    booting?(model: any): void;

    /**
     * Triggered after the model is booted.
     * @param model - The model instance that has been booted.
     */
    booted?(model: any): void;

    /**
     * Triggered before the model is created.
     * @param model - The model instance being created.
     */
    creating?(model: any): void;

    /**
     * Triggered after the model is created.
     * @param model - The model instance that has been created.
     */
    created?(model: any): void;

    /**
     * Triggered before the model is updated.
     * @param model - The model instance being updated.
     */
    updating?(model: any): void;

    /**
     * Triggered after the model is updated.
     * @param model - The model instance that has been updated.
     */
    updated?(model: any): void;

    /**
     * Triggered before the model is saved.
     * @param model - The model instance being saved.
     */
    saving?(model: any): void;

    /**
     * Triggered after the model is saved.
     * @param model - The model instance that has been saved.
     */
    saved?(model: any): void;

    /**
     * Triggered before the model is deleted.
     * @param model - The model instance being deleted.
     */
    deleting?(model: any): void;

    /**
     * Triggered after the model is deleted.
     * @param model - The model instance that has been deleted.
     */
    deleted?(model: any): void;

    /**
     * Triggered before the model is restored.
     * @param model - The model instance being restored.
     */
    restoring?(model: any): void;

    /**
     * Triggered after the model is restored.
     * @param model - The model instance that has been restored.
     */
    restored?(model: any): void;
}

export default IObserver
