(function(){
	'use strict';

	angular.module('projector.api')
		.service('TimespotsService', TimespotsService)
	;

	function TimespotsService(Restangular){
		var tspotServices = {};

		return function(timeline){
			if(tspotServices[timeline._id]) return tspotServices[timeline._id];

			var tservice = {
				tspotService: Restangular.service('timespots', timeline),

				apply: function(spot){
					Restangular.restangularizeElement(timeline, spot, 'timespots');
					if(spot._id) spot.fromServer = true;
					return spot;
				},
				create: function(item){
					return angular.extend(this.tspotService.one(), item, {_timeline: timeline._id});
				}
			}

			tspotServices[timeline._id] = tservice;
			return tservice;
		}

	}
})();