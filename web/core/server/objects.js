module.exports.configure = function(app){
	//app.get('objects/*', getObjects);
}

function getObjects(key){
	console.log("KEY", key);
	this.response.set(null, [{object: "ME!!!"}]);
}