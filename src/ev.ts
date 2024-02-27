export type EventMap = Record<string, any>;

export default class Emitter<T extends EventMap> {
    listeners: { [key in keyof T]?: [number, ((evt: T[key]) => void)][] };
    counter = 0;

    constructor() {
        this.listeners = {};
    }

    on<K extends keyof T>(key: K, listener: (evt: T[K]) => void): number {
        if (!this.listeners[key]) this.listeners[key] = [];
        const num = this.counter++;
        this.listeners[key]?.push([ num, listener ]);
        return num;
    }

    off<K extends keyof T>(key: K, listener: ((evt: T[K]) => void) | number): void {
        if (typeof listener === 'number')
            this.listeners[key] = this.listeners[key]?.filter(([n, _]) => n !== listener) || [];
        else this.listeners[key] = this.listeners[key]?.filter(([_, f]) => f !== listener) || [];
    }

    emit<K extends keyof T>(key: K, value: T[K]): void {
        this.listeners[key]?.forEach(([_, f]) => f(value));
    }
}
