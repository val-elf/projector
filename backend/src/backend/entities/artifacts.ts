import { DbModel } from '../core/db-bridge';
import { TObjectId } from '../core/models';
import { DbObjectAncestor, DbObjectController } from './dbobjects';
import { PermissionsCheck } from './decorators/permissions-check';
import { IArtifact, IEntityList, IMetadata, IUser } from './models/db.models';
import { Service } from '~/network/service';

@DbModel({
	model: 'artifacts',
})
export class Artifacts extends DbObjectAncestor<IArtifact> {
	constructor(app: Service) { super(app); }

	@PermissionsCheck({ permissions: [] })
	async getArtifactsList(projectId: TObjectId, metadata: IMetadata): Promise<IEntityList<IArtifact>> {
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

	@PermissionsCheck({ permissions: [] })
	async createArtifact(item: IArtifact, user?: IUser) {
		item = DbObjectController.normalize(item, user);
		return this.model.create(item);
	}

	@PermissionsCheck({ permissions: [] })
	async getArtifact(artifactId: TObjectId) {
		return this.model.getItem(artifactId);
	}

	@PermissionsCheck({ permissions: [] })
	async updateArtifact(item: IArtifact, user?: IUser) {
		const nitem = DbObjectController.normalize(item, user);
		return this.model.updateItem(nitem);
	}

	@PermissionsCheck({ permissions: [] })
	async deleteArtifact(itemId: string, user?: IUser) {
		return this.deleteItem(itemId, user);
	}
}

