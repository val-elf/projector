import { ProjectTabsModule } from "./tabs/project-tabs.module";
import { TimelineModule } from "./pages/timelines/timeline.module";
import { CharacterModule } from "./pages/characters/character.module";
import { ArtifactModule } from "./pages/artifacts/artifact.module";
import { LocationModule } from './pages/locations/location.module';

import { ProjectDetails } from "./project-details.component";
import { ProjectTimelines } from "./pages/project-timelines.component";
import { ProjectDocuments } from "./pages/project-documents.component";
import { ProjectCharacters } from "./pages/project-characters.component";
import { ProjectArtifacts } from "./pages/project-artifacts.component";
import { ProjectLocations } from "./pages/project-locations.component";
import { ProjectTasks } from "./pages/project-tasks.component";

import { TimelinesService, LocationsService } from "projector/api/models";

const routes = [
	{
		name: 'tab',
		url: '/tab',
		component: ProjectTabsModule.ProjectTab,
		children: ProjectTabsModule.routes
	},
	{
		name: 'timelines',
		description: 'TIMELINES',
		url: '/timelines',
		component: ProjectTimelines,
		children: TimelineModule.routes,
		resolve: [
			{
				token: 'timelines',
				deps: ['project'],
				resolveFn: project => TimelinesService.getList({}, project)
			}
		]
	},
	{
		name: 'documents',
		description: 'DOCUMENTS',
		url: '/documents',
		component: ProjectDocuments,
	},
	{
		name: 'characters',
		description: 'CHARACTERS',
		url: '/characters',
		component: ProjectCharacters,
		children: CharacterModule.routes
	},
	{
		name: 'artifacts',
		description: 'ARTIFACTS',
		url: '/artifacts',
		component: ProjectArtifacts,
		children: ArtifactModule.routes
	},
	{
		name: 'locations',
		description: 'LOCATIONS',
		url: '/locations',
		component: ProjectLocations,
		children: LocationModule.routes,
		resolve: [
			{
				token: 'locations',
				deps: ['$transition$', 'project'],
				resolveFn: (trans, project) => {
					const prms = trans.params();
					return LocationsService.getList({}, project);
				}
			}
		]
	},
	{
		name: 'tasks',
		description: 'TASKS',
		url: '/tasks',
		component: ProjectTasks,
	},
]

export const ProjectTabMenu = [
	{
		title: 'TIMELINES',
		state: 'app.projects.project.tab.timelines',
		pageState: 'app.projects.project.timelines',
		tabname: 'timelines',
	},
	{
		title: 'DOCUMENTS',
		state: 'app.projects.project.tab.documents',
		pageState: 'app.projects.project.documents',
		tabname: 'documents',
	},
	{
		title: 'CHARACTERS',
		state: 'app.projects.project.tab.characters',
		tabname: 'characters',
	},
	{
		title: 'ARTIFACTS',
		state: 'app.projects.project.tab.artifacts',
		tabname: 'artifacts',
	},
	{
		title: 'LOCATIONS',
		state: 'app.projects.project.tab.locations',
		pageState: 'app.projects.project.locations',
		tabname: 'locations',
	},
	{
		title: 'TASKS',
		state: 'app.projects.project.tab.tasks',
		pageState: 'app.projects.project.tasks',
		tabname: 'tasks',
	}
];

export const ProjectModule = {
	ProjectDetails,
	routes,
}