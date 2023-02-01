import { Locations } from '../backend';
import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';
import { utils } from '../utils/utils';

async function _prepareLocation(item){
	await utils.preparePreview(item.preview);
}

export class LocationsRouter implements IRouter {
	model: Locations;

	configure(app: Service) {
		this.model = new Locations(app);
		app.for(this.model)
			.get('/projects/:project/locations', this.getLocationsList)
			.get('/projects/:project/locations/:location', this.getLocationItem)
			.post('/projects/:project/locations', this.createLocation)
			.put('/projects/:project/locations/:location', this.updateLocation)
			.delete('/projects/:project/locations/:location', this.deleteLocation)
		;
	}

	getLocationsList = async (key) => {
		console.warn("[API] Get Locations", key);
		return await this.model.getLocationsList(key.project, key._metadata);
	}

	getLocationItem = async (key) => {
		console.warn("[API] Get Location", key);
		return this.model.getLocationItem(key.location);
	}


	createLocation = async (key, item) => {
		console.warn("[API] Create Location", key);
		item._project = key.project;
		await _prepareLocation(item);
		return this.model.createLocation(item);
	}

	updateLocation = async (key, item) => {
		console.warn("[API] Update Location", key);
		await _prepareLocation(item);
		return this.model.updateLocation(item);
	}

	deleteLocation = async (key) => {
		console.warn("[API] Delete Location", key);
		await this.model.deleteLocation(key.location);
		return { deleted: true };
	}
}
