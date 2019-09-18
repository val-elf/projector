import { LocationCard } from "./location-card.component";
import { LocationsService } from "api";

const routes = [
	{
		name: 'location',
		description: 'LOCATION',
		url: '/:locationId',
		component: LocationCard,
		resolve: [
			{
				token: 'location',
				deps: ['project', '$transition$'],
				resolveFn: (project, trans) => {
					const prms = trans.params();
					return LocationsService.getItem(prms.locationId, true, project);
				}
			},
		]
	}
];

export const LocationModule = {
	routes,
};