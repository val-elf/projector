import { Projects } from '../backend';
import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';
import { utils } from '../utils/utils';

export class ProjectsRouter implements IRouter {
	model: Projects;

	configure(app: Service) {
		this.model = new Projects(app);

		app.for(this.model)
			.get('/projects', this.getProjects)
			.post('/projects', this.createProject)
			.put('/projects/:project', this.updateProject)
			.get('/projects/:project', this.getProject)
		;
	}

	private async prepareProject(project){
		await utils.preparePreview(project.preview);
		return project;
	}

	getProjects = async (key) => {
		console.warn("[API] Get projects list", key);
		const projects = await this.model.getProjects(key._metadata);
		return projects;
	}

	getProject = async (key) => {
		console.warn("[API] Get Project", key);
		return await this.model.getProject(key.project);
	}

	createProject = async (key, project) => {
		console.warn("[API] Create new project", key);
		await this.prepareProject(project);
		return await this.model.createProject(project);
	}

	updateProject = async (key, project) => {
		console.warn("[API] Update project", key);
		await this.prepareProject(project);
		return await this.model.updateProject(project)
	}
}

