import { Model, Type, Types, Service } from "projector/api/engine";

class SystemDate extends Model {
	dt = new Type(Types.date, { key: '_dt' });
	user = new Type(Types.id, { key: '_user'});
	static config = {
		name: 'SystemDate'
	};
}

export class CommonModel extends Model {
	get previewUrl() {
		return `/srv/dbobjects/${this.id}/preview/${this.coretype}`;
	}
	static config = {
		name: 'Common'
	};
}

export class DefaultModel extends CommonModel {
	id = new Type(Types.id, { key: '_id', readonly: true });
	coretype = new Type(Types.string, { key: '_coretype', readonly: true });
	create = new Type(SystemDate, {
		key: '_create',
		readonly: true,
	});
	update = new Type(SystemDate, {
		key: '_update',
		readonly: true
	});

	static config = {
		name: 'Default'
	};
}

export class OwnerModel extends DefaultModel {
	static config = {
		name: 'Owner',
		url: 'owner',
	}
}

export class DbObjectModel extends Model {
	id = new Type(Types.id, { key: '_id', readonly: true });
	coretype = new Type(Types.string, { key: 'type', readonly: true });
	status = new Type(Types.string, { readonly: true });

	static config = {
		name: 'DbObject',
		url: 'dbobjects'
	}
}

Service.registryModels(SystemDate, OwnerModel, DefaultModel);

export const DbObjectsService = Service.createServiceFor(DbObjectModel);