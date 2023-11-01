import { IInitPreviewed, IInitProject, IProject } from '~/backend/entities/models';
import { core } from '../core';
import { IGenerationScript } from '../model';
import { utils } from '../utils';
import { IFindList } from '~/backend/core/models';

export class GenerateProjects implements IGenerationScript {
    public static async getRandomProjects(count = 3) {
        const projects = (await core.get<IFindList<IProject>>('/projects', {})).result;
        const projectIds = [];
        for(let a = 0; a < count; a++) {
            const aprojects = projects.filter(p => !projectIds.includes(p._id));
            projectIds.push(aprojects[Math.round(Math.random() * (aprojects.length - 1))]._id);
        }
        return projects.filter(project => projectIds.includes(project._id));
    }

    private tags = [];

    constructor() {
        this.tags = utils.textGenerator.getAtoms(50, 50, 9, true);
    }

    private getRandomTags(maxcount = 5) {
        const tags = [];
        const _tags = [...this.tags];
        for(let a = 0; a < maxcount; a++) {
            const index = Math.round(Math.random() * (_tags.length - 1));
            tags.push(_tags.splice(index, 1)[0]);
        }
        return tags;
    }

    public async *generate() {
        console.log('Generate Projects:');
        for await (const project of this.genProjects()) {
            // console.log('PROJECT:', project);
        }
        yield Promise.resolve('projects');
    }

    private async *genProjects() {
        let i = 0;
        while(i < 10) {
            yield await core.post('/projects', await this.createProject());
            i++;
        }
    }

    private async createProject(): Promise<IInitProject> {
        const name = utils.textGenerator.genPhrase(1, 3, Math.round(Math.random()*5 + 10), true);
        const description = utils.textGenerator.getText(Math.round(Math.random() * 5) + 3);
        const preview = await utils.loadImage();
        const tags = this.getRandomTags(Math.floor(Math.random() * 3)+ 3);
        return Promise.resolve({
            name,
            description,
            preview,
            tags
        });
    }
}