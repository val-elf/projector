var testUser = {
	_id: new ObjectId(),
	login: 'test',
	password: hex_md5('test'),
	roles: [singleUserRole._id]
}
var data = {
	users: [
		testUser
	],
	projects: [
		{
			_create: {
				_user: testUser._id,
				_dt: new Date()
			},
			name: 'Долина ветров'
		}
	],

	users: [

	]
};