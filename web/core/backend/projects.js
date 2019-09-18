var core = require("./core"),
	projectModel = core.model("projects"),
	extend = require("extend"),
	q = require('node-promise'),
	objId = require('mongodb').ObjectID
;

module.exports = function(app){
	return extend( {}, {
		getProjects: function(metadata){
			var meta = extend(metadata, {
				sort: {'_update._dt': -1}
			});
			return app.getCurrentUser(true).then(function(user){
				return projectModel.findList({'_create._user': new objId(user._id.toString())}, meta).then(function(projectsList){
					return projectsList;
				});
			});
		},
		getProject: function(projectId){
			if(!projectId) throw new Error("Project id must be defined");
			return projectModel.find({_id: projectId}).then(function(projects){
				return projects[0];
			})
		},
		createProject: function(project){
			return app.getCurrentUser(true).then(function(user){
				project = core.normalize(project, user);
				return projectModel.create(project).then(function(_project){
					return _project;
				});
			});
		},
		updateProject: function(project){
			return app.getCurrentUser(true).then(function(user){
				project = core.normalize(project, user);
				return projectModel.updateItem(project).then(function(_project){
					return _project._doc;
				});				
			})
		}
	});
};