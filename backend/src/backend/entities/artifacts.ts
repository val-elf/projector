import { DbModel } from '../core';
import { IFindList, TObjectId } from '../core/models';
import { PermissionsCheck } from './decorators/permissions-check';
import { IArtifact, IInitArtifact, IMetadata, IPreviewed } from './models';
import { Service } from '~/network/service';
import { DbObjectAncestor } from './dbbase';
import { utils } from '~/utils/utils';

type TArtifactUpdate = IInitArtifact & Partial<IPreviewed>;

@DbModel({
	model: 'artifacts',
})
export class Artifacts extends DbObjectAncestor<IArtifact, TArtifactUpdate> {
	constructor(app: Service) {
		super(app);
	}

	@PermissionsCheck({ permissions: [] })
	async getArtifactsList(projectId: TObjectId, metadata: IMetadata): Promise<IArtifact[]> {
		this.setOwners(projectId);
		const arg: any = {};
		/*
		if (metadata.hasContent) arg.hasContent = metadata.hasContent === 'true';
		if (metadata.character) {
			arg.characters = {
				_character: metadata.character
			}
		}
		*/
		const items = await this.model.findList(arg, { 'preview.preview': 0 }, metadata);
		return (items as IFindList<IArtifact>).result;
	}

	@PermissionsCheck({ permissions: [] })
	async createArtifact(item: IInitArtifact, projectId: string) {
		this.setOwners([projectId]);
		const artifact = await utils.preparePreview<TArtifactUpdate>(item);
		return this.model.create(artifact);
	}

	@PermissionsCheck({ permissions: [] })
	async getArtifact(artifactId: TObjectId) {
		return this.model.getItem(artifactId);
	}

	@PermissionsCheck({ permissions: [] })
	async updateArtifact(item: IInitArtifact): Promise<IArtifact> {
		const artifact = await utils.preparePreview<TArtifactUpdate>(item);
		return this.model.updateItem(artifact);
	}

	@PermissionsCheck({ permissions: [] })
	async deleteArtifact(itemId: string) {
		return this.deleteItem(itemId);
	}
}

