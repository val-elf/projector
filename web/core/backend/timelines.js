var core = require("./core"),
	timelineModel = core.model("timelines"),
	timespotsModel = core.model("timespots"),
	extend = require("extend"),
	promises = require("node-promise"),
	objId = require('mongodb').ObjectID;

module.exports = function(app){
	return extend({}, {
		getProjectTimelines: function(projectId){
			return timelineModel.find({_project: new objId(projectId)}).then(function(list){
				/* map timespots to list*/
				reqs = list.map(function(tl){ return tl._id;});
				/*return timespotsModel.find({_timeline: {$in: reqs}}).then(function(alltimespots){
					list.forEach(function(tl){
						//tl._doc.timespots = [];
						var sd, ed;
						alltimespots.forEach(function(ts){
							if(tl._id.equals(ts._doc._timeline)){
								sd = sd && (ts._doc.date < sd._doc.date && ts) || !sd && ts || sd;
								ed = ed && (ts._doc.date > ed._doc.date && ts) || !ed && ts || ed;
								//tl._doc.timespots.push(ts);
							}
						})

						//if(sd) tl._doc.startDate = sd._doc.date;
						//if(ed && ed != sd) tl._doc.endDate = ed._doc.date;

					});
					return list;
				});*/
				return list;
			})
		},

		getTimeline: function(timelineId){
			return timelineModel.find({_id: new objId(timelineId)}).then(function(list){
				return timespotsModel.find({_timeline: new objId(timelineId)}).then(function(timespots){
					list[0]._doc.timespots = timespots;
					return list[0]._doc;
				})
			})
		},

		create: function(timeline){
			var timespots = timeline.timespots || [];
			delete timeline.timespots;

			return app.getCurrentUser(true).then(function(user){
				timeline = core.normalize(timeline, user);
				return timelineModel.create(timeline).then(function(created){

					var dfrds = timespots.map(function(timespot){
						timespot._timeline = created._id;
						return timespotsModel.create(core.normalize(timespot, user));
					});

					return promises.all(dfrds).then(function(_timespots){						
						created._doc.timespots = _timespots;
						return created;
					});

				});

			})

		},

		update: function(timelines){
			return app.getCurrentUser().then(function(user) {
				var res = [];
				timelines.forEach(function(tl){
					tl = core.normalize(tl, user);
					delete tl.timespots;
					res.push(timelineModel.update({_id: tl._id}, tl));
				}, this);

				return promises.all(res).then(function(res){
					return res;
				});
			});
		},

		deleteTimeline: function(timelineId){
			return app.getCurrentUser(true).then(function(user){
				core.deleteItem(timelineModel, timelineId, user)
			});
		}
	});
};