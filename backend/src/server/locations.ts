import { Route, Router } from '~/network';
import { Locations } from '../backend';
import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';
import { utils } from '../utils/utils';
import { EMethod } from '~/network/route.decorator';

async function _prepareLocation(item){
    await utils.preparePreview(item.preview);
}

// @OA:tag
// name: Locations
// description: Project's locations management API
@Router()
export class LocationsRouter implements IRouter {
    model: Locations;

    configure(app: Service) {
        this.model = new Locations(app);
    }

    // @OA:route
    // description: Get list of locations
    @Route(EMethod.GET, '/projects/:projectId/locations')
    public async getLocationsList(key) {
        console.warn('[API] Get Locations', key);
        return await this.model.getLocationsList(key.projectId, key._metadata);
    }

    // @OA:route
    // description: Get location by its ID
    @Route(EMethod.GET, '/locations/:location')
    public async getLocationItem(key) {
        console.warn('[API] Get Location', key);
        return this.model.getLocationItem(key.locationId);
    }

    // @OA:route
    // description: Create new location
    @Route(EMethod.POST, '/projects/:projectId/locations')
    public async createLocation(key, item) {
        console.warn('[API] Create Location', key);
        await _prepareLocation(item);
        return this.model.createLocation(key.projectId, item);
    }

    // @OA:route
    // description: Update location
    @Route(EMethod.PUT, '/locations/:locationId')
    public async updateLocation(key, item) {
        console.warn('[API] Update Location', key);
        await _prepareLocation(item);
        return this.model.updateLocation(key.locationId, item);
    }

    // @OA:route
    // description: Delete location
    @Route(EMethod.DELETE, '/locations/:locationId')
    public async deleteLocation(key) {
        console.warn('[API] Delete Location', key);
        await this.model.deleteLocation(key.locationId);
        return { deleted: true };
    }
}
