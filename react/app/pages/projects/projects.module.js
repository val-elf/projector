import Projects from './projects.component';
import { Transition } from '@uirouter/react';
import { ProjectsService } from "~/api/models/project.model";
import { ProjectModule } from "./project/project.module";

const routes = [
	{
		name: "project",
		description: "PROJECT",
		url: '/:projectId',
		component: ProjectModule.ProjectDetails,
		children: ProjectModule.routes,
		resolve: [{
			token: 'project',
			deps: ['$transition$'],
			resolveFn: (trans) => {
				const { projectId } = trans.params();
				return ProjectsService.getItem(projectId);
			}
		}]
	}
];

Projects.routes = routes;

export const ProjectsModule = {
	Projects,
	routes
};
