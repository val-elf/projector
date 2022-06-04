const AsyncFunction = (async () => {}).constructor;

function stateHandler<T extends object>(storage: Storage<T>) {
	return {
		get: (target: object, propertyName: string) => {
			return target[propertyName];
		},
		set: (target: object, propertyName: string, value: any, reciever: any) => {
			const old = storage['$state'][propertyName];
			if (old !== value) {
				target[propertyName] = value;
				storage['trigger'](`@${propertyName}`, value, old);
				return true;
			}
			return false;
		}
	}
}

export class Storage<S extends object> {
	private _state: S;
	protected $state: S;

	get state(): Readonly<S> {
		return { ...this.$state as object } as S;
	}

	private _mutators: Function[] = [];
	private _actions: Function[] = [];
	private _lock: boolean = false;

	private _subscriptions: { [key: string]: Function[] } = {};

	constructor(initialState: S) {
		this._state = Object.assign({}, initialState);
		this.$state = new Proxy<S>(this._state, stateHandler<S>(this)) as S;
	}

	subscribe(propertyName: string, callback: Function) {
		let callbacks = this._subscriptions[propertyName];
		if (!callbacks) {
			callbacks = [callback];
			this._subscriptions[propertyName] = callbacks;
		} else callbacks.push(callback);
	}

	private trigger(propertyName: string, ...args: any[]) {
		const callbacks = this._subscriptions[propertyName] || [];
		return callbacks.map(cb => cb(this.state, ...args)).filter(res => res);
	}
}

export function mutator() {
	return function (target: Storage<any>, propertyKey: string, descriptor: PropertyDescriptor) {
		const { value } = descriptor;
		descriptor.value = function(...args) {
			const res = value.apply(this, args);
			if (!this._lock) return this.trigger(propertyKey, ...args, res);
			return res;
		}
	}
}

export function action(options?: {
	lock: boolean
}) {
	return function (target: Storage<any>, propertyKey: string, descriptor: PropertyDescriptor) {
		const { value } = descriptor;
		descriptor.value = function(...args) {
			let res;
			try {
				this._lock = options && options.lock;
				res = value.apply(this, args);
			} finally {
				this._lock = false;
			}
			return this.trigger(propertyKey, ...args, res);
		}
	}
}

/* it s a sample of usage
interface IStorage {
	counter: number;
}

class myStorage extends Storage<IStorage> {

	constructor() {
		super({ counter: 0 });
	}

	@mutator()
	increment() {
		this.$state.counter++;
	}

	@action()
	nextPage() {
		this.increment();
	}

}

const st = new myStorage();

st.subscribe('increment', (state) => {
	console.log('New state', state);
});

st.subscribe('@counter', (state, count, pcount) => {
	console.log('New state with attr', state, count, pcount);
});

st.nextPage();

*/