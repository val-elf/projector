const { CommonEntity, Core } = require('./core');
const dbobjectModel = Core.getModel('dbobjects');

class DbObject extends CommonEntity {
	getDbObject(objectId) {
		return dbobjectModel.getItem({_id: objectId});
	}
}

module.exports = DbObject;