import { Artifact } from "./artifact.component.js";
import { ArtifactsService } from "projector/api/models";

const routes = [
	{
		name: 'artifact',
		description: 'ARTIFACT',
		url: '/:artifactId',
		component: Artifact,
		resolve: [
			{
				token: 'artifact',
				deps: ['$transition$', 'project'],
				resolveFn: (transition, project) => {
					const prms = transition.params();
					return ArtifactsService.getItem(prms.artifactId, true, project);
				}
			}
		]
	}
]

export const ArtifactModule = {
	routes
}