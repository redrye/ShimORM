export default interface IFireableEvents {
    /**
     * Triggers an event using the internal event emitter and passes the current instance as an argument.
     *
     * @param {string} event - The name of the event to be fired.
     * @return {void} This method does not return any value.
     */

    fireEvent(event: string): void
}