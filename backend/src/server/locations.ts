import { Route, Router } from '~/network';
import { Locations } from '../backend';
import { IFindList, IRouter } from '../backend/core/models';
import { Service } from '../network/service';
import { utils } from '../utils/utils';
import { EMethod } from '~/network/route.decorator';
import { IInitLocation, ILocation } from '~/backend/entities/models';

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
    // security: [APIKeyHeader:[]]
    // description: Get list of locations
    // parameters: [projectId: Project ID]
    // responses: [200: List of locations]
    @Route(EMethod.GET, '/projects/:projectId/locations')
    public async getLocationsList(key): Promise<ILocation[]> {
        console.warn('[API] Get Locations', key);
        return await this.model.getLocationsList(key.projectId, key._metadata);
    }

    // @OA:route
    // security: [APIKeyHeader:[]]
    // description: Get location by its ID
    // parameters: [locationId: Id of Location]
    // responses: [200: Location instance]
    @Route(EMethod.GET, '/locations/:locationId')
    public async getLocationItem(key): Promise<ILocation> {
        console.warn('[API] Get Location', key);
        return this.model.getLocationItem(key.locationId);
    }

    // @OA:route
    // security: [APIKeyHeader:[]]
    // description: Create new location
    // parameters: [projectId: Project ID]
    // requestBody: [item: IInitLocation]
    // responses: [200: Location instance]
    @Route(EMethod.POST, '/projects/:projectId/locations')
    public async createLocation(key, item: IInitLocation): Promise<ILocation> {
        console.warn('[API] Create Location', key);
        await _prepareLocation(item);
        return this.model.createLocation(key.projectId, item);
    }

    // @OA:route
    // security: [APIKeyHeader:[]]
    // description: Update location
    // parameters: [locationId: Id of Location]
    // requestBody: [item: IInitLocation]
    // responses: [200: Location instance]
    @Route(EMethod.PUT, '/locations/:locationId')
    public async updateLocation(key, item: IInitLocation): Promise<ILocation> {
        console.warn('[API] Update Location', key);
        await _prepareLocation(item);
        return this.model.updateLocation(key.locationId, item);
    }

    // @OA:route
    // security: [APIKeyHeader:[]]
    // description: Delete location
    // parameters: [locationId: Id of Location]
    // responses: [200: Deleted location flag]
    @Route(EMethod.DELETE, '/locations/:locationId')
    public async deleteLocation(key): Promise<{ deleted: boolean }> {
        console.warn('[API] Delete Location', key);
        await this.model.deleteLocation(key.locationId);
        return { deleted: true };
    }
}
