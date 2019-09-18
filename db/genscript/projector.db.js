var connection = new Mongo();
var db = connection.getDB('projector');

/* clean database */
db.getCollectionNames().forEach(function(coll){
	if(coll.indexOf("system.") == -1) db[coll].drop();
});
print("Clean end successfully");

/* 
	collections are exists
	projector - settings
	sessions - sessions of users
	projects
	timelines
	timespots
	users
*/
['projector', 'sessions', 'projects', 'timelines', 'timespots', 'vendors', 'users', 'roles', 'userGroups', 'permissions', 'acl']
	.forEach(function(coll){
		db.createCollection(coll);
	});

function Insert(data) {
	Object.keys(data)
		.forEach(function(coll){
			data[coll].forEach(function(item){
				db[coll].insert(item);
			});
		});
}

/* add user admin and guest */
load('initData.js');
Insert(data);

load('customData.js');
Insert(data);

print ("Generate done.")
