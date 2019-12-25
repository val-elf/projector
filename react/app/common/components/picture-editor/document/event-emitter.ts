export class EventEmitter {
	_procs: { [key: string]: Function[] } = {};

	on(event: string, cb: Function) {
		let proc = this._procs[event];
		if (!proc) {
			proc = [];
			this._procs[event] = proc;
		}
		if (!proc.includes(cb)) proc.push(cb);
	}

	off(event: string, cb: Function) {
		let procs = this._procs[event];
		if (procs && procs.includes(cb)) {
			procs.splice(procs.indexOf(cb), 1);
		}
	}

	trigger(event: string, ...params: any[]) {
		const proc = this._procs[event] || [];
		proc.forEach(cb => cb(...params));
	}
}