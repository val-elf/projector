import { EMethod } from '~/network/route.decorator';
import { Projects } from '../backend';
import { IRouter } from '../backend/core/models';
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
    // description: Get list of projects
    @Route(EMethod.GET, '/projects')
    async getProjects(key) {
        console.warn('[API] Get projects list', key);
        const projects = await this.model.getProjects(key._metadata);
        return projects;
    }

    // @OA:route
    // description: Get project by ID
    @Route(EMethod.GET, '/projects/:project')
    async getProject(key) {
        console.warn('[API] Get Project', key);
        return await this.model.getProject(key.project);
    }

    // @OA:route
    // description: Create new project
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
    // description: Update project
    @Route(EMethod.PUT, '/projects/:project')
    async updateProject(key, project: IInitProject) {
        console.warn('[API] Update project', key);
        const updated = await this.prepareProject(project);
        return await this.model.updateProject(updated);
    }
}
