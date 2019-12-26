import { Service, Model, Type } from "~/api/engine";
import { DefaultModel } from "api/default.model";
import { Preview } from "api/preview.model";
import { Project } from "api/project.model";

class Position extends Model {
	x = Type.Number;
	y = Type.Number;

	static config = {
		name: 'Position'
	};
}

class ParentLink extends Model {
	position = new Type(Position);
	scale = Type.Number;
	location = new Type('Location',
		{
			key: '_location',
			link: true,
			parent: (parentLink) => {
				const location = parentLink.getParent();
				return location.getParent();
			}
		});

	static config = {
		name: 'ParentLink'
	};
}

export class Location extends DefaultModel {
	name = Type.String;
	locationType = Type.String;
	project = new Type(Project, { key: '_project', parent: true });
	position = new Type(Position);
	map = new Type([Object]);
	parent = new Type(ParentLink);
	preview = new Type(Preview);
	scale = Type.Number;

	get baseZoom() {
		return LocationTypes[this.locationType].zoom;
	}

	static config = {
		name: 'Location',
		url: 'locations'
	}
}

Service.registryModels(Position, ParentLink);

export const LocationsService = Service.createServiceFor(Location, Project);

export const LocationTypes = {
	'celestial': {},
	'star': {},
	'satellite': { zoom: 0.001 },
	'planet': { parents: ['star'], zoom: 1 },
	'mainland': { parents: ['planet', 'satellite'], zoom: 10 },
	'continent': { parents: ['planet', 'satellite', 'mainland'], zoom: 10 },
	'georegion': { parents: ['planet', 'satellite', 'mainland', 'continent'], zoom: 10 },
	'state': { parents: ['planet', 'satellite', 'mainland', 'continent', 'georegion'], zoom: 10 },
	'area': { parents: ['state', 'georegion', 'continent'], zoom: 100 },
	'region': { parents: ['state', 'area'], zoom: 100 },
	'city': { parents: ['state', 'area', 'region'], zoom: 1000 },
	'settlement': { parents: ['state', 'area', 'region'], zoom: 1000 },
	'nature': { parents: ['continent', 'georegion'], zoom: 100 }
}
