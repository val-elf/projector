import { DbModel } from '../core/db-bridge';
import { DbObjectAncestor, DbObjectController } from './dbobjects';
import { IArtifact, IEntityList } from './models/db.models';
import { Service } from '~/network/service';

@DbModel({
	model: 'artifacts',
})
export class Artifacts extends DbObjectAncestor<IArtifact> {
	constructor(app: Service) { super(app); }

	async getArtifactsList(projectId, metadata): Promise<IEntityList<IArtifact>> {
		const arg: any = { _project: projectId };
		if (metadata.hasContent) arg.hasContent = metadata.hasContent === 'true';
		if (metadata.character) {
			arg.characters = {
				_character: metadata.character
			}
		}
		const items = await this.model.findList(arg, { 'preview.preview': 0 }, metadata);
		return this.preapareItemsList<IArtifact>(items) as IEntityList<IArtifact>;
	}

	async createArtifact(item) {
		item = this.dbObject.normalize(item);
		return this.model.create(item);
	}

	async getArtifact(artifactId) {
		return this.model.getItem(artifactId);
	}

	async updateArtifact(item: IArtifact) {
		const nitem = this.dbObject.normalize(item);
		return this.model.updateItem(nitem);
	}

	async deleteArtifact(itemId: string) {
		return this.deleteItem(itemId);
	}
}

