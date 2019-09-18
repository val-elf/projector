import { DefaultModel } from "./default.model";
import { Model, Type, Types, Service } from "projector/api/engine";
import { Character } from './character.model';
import { Location } from './location.model';
import { Timeline } from './timeline.model';
import { Document, DocumentsService } from './document.model';

export class TimespotCharacter extends Model {
	character = new Type(Character, {
		key: '_character',
		link: true,
		parent: timespot => timespot.timeline.project
	});
	document = new Type(Document, {
		key: '_document',
		link: true
	});

	static config = {
		name: 'TimespotCharacter'
	}
}

export class Timespot extends DefaultModel {
	title = new Type(Types.string);
	startOffsetX = new Type(Types.number);
	endOffsetX = new Type(Types.number);
	locked = new Type(Types.boolean);
	timeline = new Type(Timeline, { key: '_timeline' });
	characters = new Type([TimespotCharacter]);
	locations = new Type([Location]);

	get startDate() {
		return this.timeline.getDateForPoint(this.startOffsetX);
	}

	set startDate(value) {
		this.startOffsetX = this.timeline.getPointForDate(value);
	}

	get endDate() {
		return this.timeline.getDateForPoint(this.endOffsetX);
	}

	set endDate(value) {
		this.endOffsetX = this.timeline.getPointForDate(value);
	}

	get documents() {
		if (this.__documents) return this.__documents;
		if (this.created) return [];
		return (async () => {
			const docs = await DocumentsService.getList({}, this);
			this.__documents = docs;
			return this.__documents;
		})();
	}

	get isAlone() {
		return !this.endDate;
	}

	get document() {
		return { content: '' };
	}

	async toggleLocked() {
		this.locked = !this.locked;
		await this.save();
	}

	static config = {
		name: 'Timespot',
		url: 'timespots',
	};
}

Service.registryModels(TimespotCharacter);
export const TimespotsService = Service.createServiceFor(Timespot);
