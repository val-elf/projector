import { EMethod } from '~/network/route.decorator';
import { Projects } from '../backend';
import { IFindList, IRouter } from '../backend/core/models';
import { Service, Route, Router } from '../network';
import { utils } from '../utils/utils';
import { IInitProject, IPreviewed, IProject } from '~/backend/entities/models';

// @OA:tag
// name: Projects
// description: Projects management API
@Router()
export class ProjectsRouter implements IRouter {
    model: Projects;

    configure(app: Service) {
        this.model = new Projects(app);
    }

    private async prepareProject(project: IInitProject) {
        return await utils.preparePreview<IInitProject & Partial<IPreviewed>>(project);
    }

    // @OA:route
    // security: [APIKeyHeader:[]]
    // description: Get list of projects
    // responses: [200: List of projects]
    @Route(EMethod.GET, '/projects')
    async getProjects(key): Promise<IFindList<IProject>> {
        console.warn('[API] Get projects list', key);
        const projects = await this.model.getProjects(key._metadata);
        return projects;
    }

    // @OA:route
    // security: [APIKeyHeader:[]]
    // description: Get project by ID
    // parameters: [projectId: Project ID]
    // responses: [200: Project instance]
    @Route(EMethod.GET, '/projects/:projectId')
    async getProject(key): Promise<IProject> {
        console.warn('[API] Get Project', key);
        return await this.model.getProject(key.projectId);
    }

    // @OA:route
    // security: [APIKeyHeader:[]]
    // description: Create new project
    // requestBody: [item: IInitProject]
    // responses: [200: Project instance]
    @Route(EMethod.POST, '/projects')
    async createProject(
        key,
        projectModel: IInitProject
    ): Promise<IProject> {
        console.warn('[API] Create new project', key);
        const project = await this.prepareProject(projectModel);
        return await this.model.createProject(project);
    }

    // @OA:route
    // security: [APIKeyHeader:[]]
    // description: Update project
    // parameters: [projectId: Project ID]
    // requestBody: [item: IInitProject]
    // responses: [200: Project instance]
    @Route(EMethod.PUT, '/projects/:projectId')
    async updateProject(key, project: IInitProject): Promise<IProject> {
        console.warn('[API] Update project', key);
        const updated = await this.prepareProject(project);
        return await this.model.updateProject(updated);
    }
}
