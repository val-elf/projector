var superAdminId = new ObjectId();
var superAdminRoleId = new ObjectId();

var adminUser = {
	'_id': new ObjectId('5602ac7c544733cfe44c4833'), //static id,
	'_group': superAdminId,
	'login': 'admin',
	'password': hex_md5('earlcaliostro'),
	roles: [superAdminRoleId]
};

var superAdminRole = {
		'_id': superAdminRoleId,
		name: 'superadmin',
		permissions: ['all']
	},
	singleUserRole = {
		'_id': new ObjectId(),
		name: 'single',
		permissions: ['all']
	}
;


var guestUser = {
	'_id': new ObjectId('5602ac7c544733cfe44c4834'), //static id
	'login': 'guest'
};

var data = {
	permissions: [
		{
			value: 'read',
			type: 'users',
			group: 'system'
		},
		{
			value: 'create',
			type: 'users',
			group: 'system'
		},
		{
			value: 'update',
			type: 'users',
			group: 'system'
		},
		{
			value: 'read',
			type: 'projects',
			group: 'vendor'
		},
		{
			value: 'create',
			type: 'projects',
			group: 'vendor'
		},
		{
			value: 'update',
			type: 'projects',
			group: 'vendor'
		},
		{
			value: '',
			type: '',
			group: ''
		}
	],
	roles: [
		superAdminRole,
		singleUserRole
	],
	userGroups: [
		{
			'_id': superAdminId,
			name: 'superadmin'
		}
	],
	users: [
		adminUser, 
		guestUser
	],
};
