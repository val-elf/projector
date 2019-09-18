const { Core, CommonEntity } = require('./core');
const artModel = Core.getModel('artifacts');

module.exports = class Artifacts extends CommonEntity {

	async getArtifactsList(projectId, metadata) {
		await this.app.getCurrentUser();
		const arg = { _project: projectId };
		if (metadata.hasContent) arg.hasContent = metadata.hasContent === 'true';
		if (metadata.character) {
			arg.characters = {
				_character: metadata.character
			}
		}
		return artModel.findList(arg, { 'preview.preview': 0 }, metadata);
	}

	async createArtifact(item) {
		const user = await this.app.getCurrentUser();
		item = Core.normalize(item, user);
		return artModel.create(item);
	}

	async getArtifact(artifactId) {
		await this.app.getCurrentUser();
		return artModel.getItem(artifactId);
	}

	async updateArtifact(item) {
		const user = await this.app.getCurrentUser();
		item = Core.normalize(item, user);
		return artModel.updateItem(item);
	}

	async deleteArtifact(itemId) {
		await this.app.getCurrentUser();
		return artModel.deleteItem(itemId, user);
	}
}