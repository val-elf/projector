(function(){
	'use strict';

	angular.module('projector.api')
		.service('TimelinesService', TimelinesService)
	;

	function TimelinesService(Restangular, TimespotsService){

		var pservs = {};

		angular.extend(this, {
			getOffset: function(startDate, date, timelength){
				return ((date - startDate) / timelength) * 100;
			},
			getDate: function(startDate, pos, timelength) {
				return new Date(startDate.getTime() + Math.round(timelength * pos / 100));
			},
			actualizationTimespot: function(timeline, timespot, whatChanged){
				if(!timeline.startDate || !timeline.endDate) return;
				var timelength = timeline.endDate.getTime() - timeline.startDate.getTime();
				switch(whatChanged){
					case 'startDate':
						timespot.startOffsetX = this.getOffset(timeline.startDate, timespot.startDate, timelength);
					break;
					case 'endDate':
						timespot.endOffsetX = this.getOffset(timeline.startDate, timespot.endDate, timelength);
					break;
					case 'startOffset':
						timespot.startDate = this.getDate(timeline.startDate, timespot.startOffsetX, timelength);
					break;
					case 'endOffset':
						timespot.endDate = this.getDate(timeline.startDate, timespot.endOffsetX, timelength);
					break;
				}
			}
		});

		return function(project){
			if(pservs[project._id]) return pservs[project._id];

			var pserve = {

				timelines: Restangular.service("timelines", project),

				getList: function(){
					return this.timelines.getList();
				},
				get: function(timelineId){
					return this.timelines.one(timelineId).get().then(function(timeline){
						var tspotserv = TimespotsService(timeline);
						timeline.timespots = timeline.timespots.map(tspotserv.apply);
						return timeline;
					});
				},
				refresh: function(){
					return this._onRefreshCallback && this._onRefreshCallback();
				},
				onRefresh: function(cb){
					this._onRefreshCallback = cb;
				},
				create: function(){
					return this.timelines.one();
				}
			}

			pservs[project._id] = pserve;
			return pserve;
		}
	}

})();