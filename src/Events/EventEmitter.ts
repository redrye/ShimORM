class EventEmitter {

    listeners = {}

    constructor() {
        this.listeners = {};
    }

    on(event, listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
    }

    emit (event,...args) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(listener => {
                if(listener) listener(...args)
            });
        }
    }

    off(event, listenerToRemove) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(listener => listener !== listenerToRemove);
        }
    }

    once(event, listener) {
        const onceListener = (...args) => {
            listener(...args);
            this.off(event, onceListener);
        };
        this.on(event, onceListener)
    }
}

export default EventEmitter;