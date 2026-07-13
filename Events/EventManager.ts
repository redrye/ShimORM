class EventManager {
    events: Record<string, any> = {}

    on(event: string, callback: (...args: any[]) => any) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event: string, ...args: any[]) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(...args));
        }
    }

    off(event: string, callback: (...args: any[]) => any | undefined) {
        if (this.events[event]) {
            if (!callback) {
                delete this.events[event] = [];
                return;
            } else {
                this.events[event] = this.events[event].filter(cb => cb !== callback);
            }
        }
    }

    once(event: string, callback: (...args: any[]) => any) {
        const onceCallback = (...args: any[]) => {
            this.off(event, onceCallback);
            callback(...args);
        };
        this.on(event, onceCallback);
    }
}

export default EventManager;