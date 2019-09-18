export class EventEmitter {
	_procs = {};

	on(event, cb) {
		let proc = this._procs[event];
		if (!proc) {
			proc = [];
			this._procs[event] = proc;
		}
		if (!proc.includes(cb)) proc.push(cb);
	}

	off(event, cb) {
		let procs = this._procs[event];
		if (procs && procs.includes(cb)) {
			procs.splice(procs.indexOf(cb), 1);
		}
	}

	trigger(event, ...params) {
		const proc = this._procs[event] || [];
		proc.forEach(cb => cb(...params));
	}
}