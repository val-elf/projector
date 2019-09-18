export class Eventful {
	_events = {};

	on(eventType, cb) {
		const regs = this._events[eventType];
		if (!regs) {
			this._events[eventType] = [cb];
		} else {
			if (regs.indexOf(cb) === -1) regs.push(cb);
		}
	}

	off(eventType, cb) {
		const regs = this._events[eventType];
		if (regs) {
			const index = regs.indexOf(cb);
			if (index > -1) regs.splice(index, 1);
		}
	}

	trigger(eventType, ...params) {
		const regs = this._events[eventType];
		regs && regs.reverse().forEach((cb) => {
			cb(...params);
		});
	}
}