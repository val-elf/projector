import { ProjectTimelines } from "./timelines/project-timelines.component";
import { ProjectDocuments } from "./documents/project-documents.component";
import { ProjectCharacters } from "./characters/project-characters.component";
import { ProjectArtifacts } from "./artifacts/project-artifacts.component";
import { ProjectLocations } from "./locations/project-locations.component";
import { ProjectTasks } from "./tasks/project-tasks.component";
import { ProjectTab } from "./project-tab.component";

import { ArtifactsService } from "projector/api/models";
import { CharactersService } from "projector/api/models/character.model";

const routes = [
	{
		name: 'timelines',
		description: 'TIMELINES',
		url: '/timelines',
		component: ProjectTimelines,
	},
	{
		name: 'documents',
		description: 'DOCUMENTS',
		url: '/documents?category',
		params: {
			category: {
				dynamic: true
			}
		},
		component: ProjectDocuments
	},
	{
		name: 'characters',
		description: 'CHARACTERS',
		url: '/characters',
		component: ProjectCharacters,
	},
	{
		name: 'artifacts',
		description: 'ARTIFACTS',
		url: '/artifacts',
		component: ProjectArtifacts,
	},
	{
		name: 'locations',
		description: 'LOCATIONS',
		url: '/locations',
		component: ProjectLocations,
	},
	{
		name: 'tasks',
		description: 'TASKS',
		url: '/tasks',
		component: ProjectTasks,
	},
];

export const ProjectTabsModule = {
	ProjectTab,
	routes
};