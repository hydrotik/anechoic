type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

export interface Emitter<T extends EventMap> {
	on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
	off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
	emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}

export default class EventEmitter {
	private events: object;

	constructor() {
	  this.events = {};
	}

	on(event, listener) {
		if (typeof this.events[event] !== 'object') {
			this.events[event] = [];
		}
		this.events[event].push(listener);
		return () => this.removeListener(event, listener);
	}

	removeListener(event, listener) {
	  if (typeof this.events[event] === 'object') {
		  const idx = this.events[event].indexOf(listener);
		  if (idx > -1) {
			this.events[event].splice(idx, 1);
		  }
	  }
	}

	emit(event, ...args) {
	  if (typeof this.events[event] === 'object') {
		this.events[event].forEach(listener => listener.apply(this, args));
	  }
	}
	
	once(event, listener) {
	  const remove = this.on(event, (...args) => {
		  remove();
		  listener.apply(this, args);
	  });
	}
  };
  

/*

type EventMap = Record<string, any>;

type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

export interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>>
	(eventName: K, fn: EventReceiver<T[K]>): void;
  off<K extends EventKey<T>>
	(eventName: K, fn: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>
	(eventName: K, params: T[K]): void;
}


export default class EventProvider<T extends EventMap> implements Emitter<T> {
	private emitter = new EventEmitter();
	
	on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
		this.emitter.on(eventName, fn);
	}

	off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
		this.emitter.off(eventName, fn);
	}

	emit<K extends EventKey<T>>(eventName: K, params: T[K]) {
		this.emitter.emit(eventName, params);
	}
}
*/
