// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

export interface Emitter<T extends EventMap> {
	on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
	off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
	emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}

export type EventParams = {
	type: string;
	state?: AudioContextState;
	message?: string;
	currentIndex?: number;
	loopCount?: number | number[] | undefined;
	audioCtx?: AudioContext;
	source?: AudioBufferSourceNode;
}

export default class EventEmitter {
	private events: EventMap;

	constructor() {
		this.events = {};
	}

	on(event: string, listener: () => void): () => void {
		if (typeof this.events[event] !== 'object') {
			this.events[event] = [];
		}
		this.events[event].push(listener);
		return () => this.removeListener(event, listener);
	}

	removeListener(event: string, listener: () => void): void {
		if (typeof this.events[event] === 'object') {
			const idx = this.events[event].indexOf(listener);
			if (idx > -1) {
				this.events[event].splice(idx, 1);
			}
		}
	}

	emit(event: string, ...args: EventParams[]): void {
		if (typeof this.events[event] === 'object') {
			this.events[event].forEach((listener: () => void) => listener.apply(this, args as []));
		}
	}

	once(event: string, listener: () => void): void {
		const remove = this.on(event, (...args) => {
			remove();
			listener.apply(this, args);
		});
	}
}
