import moment from 'moment';
import { Type, Types, Service } from "projector/api/engine" ;
import { DefaultModel } from "./default.model";
import { Project } from "./project.model";

export class Timeline extends DefaultModel {
	name = new Type(Types.string);
	locked = new Type(Types.boolean);
	startDate = new Type(Types.date);
	endDate = new Type(Types.date);
	project = new Type(Project, { key: '_project', parent: true });
	timespots = new Type(['Timespot'], { readonly: true });

	get timelength() {
		if (!this.endDate) return;
		const edate = moment(this.endDate);
		edate.set('hours', 23);
		edate.set('minutes', 59);
		edate.set('seconds', 59);
		return edate.diff(this.startDate);
	}

	setRange(left, right) {
		this._range = { left, right };
	}

	get length() {
		if (!this._range) return;
		return this._range.right - this._range.left;
	}

	getRelativeLocation(absPos) {
		if (!this._range) return;
		let position = absPos - this._range.left;
		position = position < 0 ? 0 : position > this.length ? this.length : position;
		return position / this.length * 100;
	}

	getDateForPoint(pos /* position in percents */) {
		const { timelength } = this;
		if(!timelength) return;
		var timeshift = Math.round(timelength * pos / 100),
			tm = new Date(this.startDate.getTime() + timeshift)
		return tm;
	}

	getPointForDate(date) {
		const { timelength } = this;
		const timeshift = Math.round((date.getTime() - this.startDate.getTime()) / 1000);
		return timeshift / timelength * 100000;
	}

	async toggleLocked() {
		this.locked = !this.locked;
		await this.save();
	}

	static config = {
		name: 'Timeline',
		url: 'timelines',
	};
}

export const TimelinesService = Service.createServiceFor(Timeline, Project);
