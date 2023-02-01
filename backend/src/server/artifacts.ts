import { Artifacts } from "../backend/entities/artifacts";
import { IRouter } from "../backend/core/models";
import { Service } from '../network/service';
import { utils } from '~/utils/utils';

export class ArtifactRouter implements IRouter {
	public model: Artifacts;

	private async _prepareArtifact(item){
		await utils.preparePreview(item.preview);
	}

	configure(app: Service){
		this.model = new Artifacts(app);
		app.for(this.model)
			.get('/projects/:project/artifacts', this.getArtifactsList)
			.get('/projects/:project/artifacts/:artifact', this.getArtifact)
			.post('/projects/:project/artifacts', this.createArtifact)
			.put('/projects/:project/artifacts/:artifact', this.updateArtifact)
			.delete('/projects/:project/artifacts/:artifact', this.deleteArtifact)
		;
	}

	private getArtifactsList = async (key) => {
		console.warn("[API] Get Artifacts", key);
		return await this.model.getArtifactsList(key.project, key._metadata);
	}

	private getArtifact = async (key) => {
		console.warn("[API] Get Artifact", key);
		return await this.model.getArtifact(key.artifact);
	}

	private createArtifact = async(key, item) => {
		console.warn("[API] Create Artifact", key);
		item._project = key.project;
		await this._prepareArtifact(item);
		return await this.model.createArtifact(item);
	}

	private updateArtifact = async (key, item) => {
		console.warn("[API] Update Artifact", key);
		await this._prepareArtifact(item);
		return await this.model.updateArtifact(item);
	}

	private  deleteArtifact = async (key) => {
		console.warn("[API] Delete Artifact", key);
		await this.model.deleteArtifact(key.artifact);
		return { deleted: true };
	}
}
