(function(){
	'use strict';

	angular.module('projector.filters')
		.filter('datetime', DateTimeFilter)
		.filter('spendDate', SpendDateFilter)
		.filter('cropdatetime', CropDateTimeFilter)
	;


	function DateTimeFilter($filter){
		return function(value){
			var dtf = $filter('date');
			return dtf(value, 'dd MMM yyyy H:mm')
		}
	}

	function CropDateTimeFilter($filter){
		return function(value){
			
		}
	}

	function SpendDateFilter($filter){
		return function(value){
			var dt = new Date(), sdiff = Math.round((dt - value) / 1000),
				mdiff = Math.floor(sdiff / 60),
				hdiff = Math.floor(sdiff / 3600),
				ddiff = Math.floor(sdiff / 86400);
			if(mdiff < 1){ //seconds
				return sdiff + " сек. назад";
			} else if(hdiff <1){ //minutes
				return mdiff + " мин. назад";
			} else if(ddiff < 1){ //hours
				return hdiff + " час. назад";
			} else if(ddiff < 7){ //days
				return ddiff + " дн. назад";
			} else if(ddiff <= 31){ //weeks
				return Math.round(ddiff / 7) + " нед. назад";
			} else { // more than weeks
				var mc = dt.getFullYear() * 12 + dt.getMonth(),
					mc2 = value.getFullYear() * 12 + value.getMonth(),
					dm = mc - mc2;
				if(dm < 12){
					return dm + " мес. назад";
				} else
					return (Math.floor(dm/12) + 1) + " лет. назад";
			}

			return $filter('date')(value, 'dd MMM yyyy H:mm');
		}
	}
})();