import { ELocationType, IInitLocation, ILocation } from '~/backend/entities/models';
import { IGenerationScript } from '../model';
import { utils } from '../utils';
import { GenerateProjects } from './generate-projects';
import { core } from '../core';
import { getRandomShape } from './mock/location-shapes';
import { ObjectId } from 'mongodb';
import { assert } from 'console';
import { TObjectId } from '~/backend/core/models';

export class GenerateLocations implements IGenerationScript {
    public async *generate() {

        const projects = await GenerateProjects.getRandomProjects();
        const projectIds = projects.map(p => p._id);
        // generate new locations
        yield *this.generateNewLocations(projectIds);

        let randomProjectId = utils.getRandomItem(projectIds);

        let projectLocations = await core.get<ILocation[]>(`/projects/${randomProjectId}/locations`);
        assert(projectLocations.length >= 5, 'No locations found for project: ' + randomProjectId);

        // get particular location
        let randomLocationId = utils.getRandomItem(projectLocations)._id;
        yield *this.updateLocation(randomLocationId);

        // get another one random project
        randomProjectId = utils.getRandomItem(projectIds);

        // get another ones project locations
        projectLocations = await core.get<ILocation[]>(`/projects/${randomProjectId}/locations`);
        const locationsCount = projectLocations.length;

        // get another one random location
        randomLocationId = utils.getRandomItem(projectLocations)._id;
        yield *this.deleteLocation(randomLocationId);
        projectLocations = await core.get<ILocation[]>(`/projects/${randomProjectId}/locations`);
        console.log('New locations and old locations', locationsCount, projectLocations.length);

        // repeat getting projectLocations

        yield true;
    }

    private async *deleteLocation(locationId: TObjectId) {
        const deleted = await core.delete(`/locations/${locationId}`);
        console.log('Deleted result', deleted);
        yield true;
    }

    private async *updateLocation(locationId: TObjectId) {
        const location = await core.get<ILocation>(`/locations/${locationId}`);
        assert(location && location._id === locationId, 'Location not found: ' + locationId);

        const oldName = location.name;
        // update location
        location.name = utils.textGenerator.getEntities(1, 3, 14, true);
        const updated = await core.put(`/locations/${locationId}?updateDate&createDate`, location);
        const { _created, _updated } = updated;
        assert(
            updated &&
            updated.name !== oldName &&
            _created._dt !== _updated._dt,
            'Location not updated: ' + locationId
        );
        yield true;
    }

    private async *generateNewLocations(projectIds: TObjectId[]) {
        for await(const projectId of projectIds) {
            const locationsCount = 5 + Math.round(Math.random() * 5);
            for (let i = 0; i < locationsCount; i++) {
                const location = await this.createLocation();
                const serverLocation = await core.post(`/projects/${projectId}/locations`, location);
            }
        }
    }

    private async createLocation(): Promise<IInitLocation> {
        const locationTypes = Object.keys(ELocationType);
        const locationType = ELocationType[Math.round(Math.random() * (locationTypes.length - 1))];
        const locationName = utils.textGenerator.getEntities(1, 3, 14, true);
        const locationDescription = utils.textGenerator.getSentence();
        const preview = await utils.loadImage();
        const map = [];
        const mapsCount = Math.round(Math.random() * 10);
        for (let i = 0; i < mapsCount; i++) {
            const mapType = ['shape', 'image'][Math.round(Math.random() * 2)];
            switch(mapType) {
                case 'shape':
                    map.push({
                        shape: getRandomShape(),
                    });
                break;
                case 'image':
                    map.push({
                        image: {
                            _file: new ObjectId(),
                            width: Math.round(Math.random() * 1000),
                            height: Math.round(Math.random() * 1000),
                            zoom: 1,
                            x: 0,
                            y: 0,
                        }
                    })
                break;
            }
        }
        return {
            name: locationName,
            description: locationDescription,
            locationType: locationType,
            preview,
            position: {
                x: Math.round(Math.random() * 100),
                y: Math.round(Math.random() * 100),
            },
            map,
            scale: 1,
        };

    }
}