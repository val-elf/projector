(function(){
	'use strict';

	angular.module('projector.services')
		.factory('Eventful', EventfulFactory)
	;

	function EventfulFactory(){
		function Eventful(){
			angular.extend(this, {
				_cb: {},
				on: function(eventTypes, cb){
					var res = [];
					res = eventTypes.split(/\s+/).map( eventType => {
						var ev = this._cb[eventType];
						if(!ev){
							ev = [];
							this._cb[eventType] = ev;
						}
						var key = ev.indexOf(cb);
						if(key === -1 ){
							ev.push(cb);
							return ev.length - 1;
						}
						return key;
					});
					return res.length > 1 ? res : res[0];
				},
				off: function(eventType, cb){
					var index, ev = this._cb[eventType];
					if(!ev) return;
					if(typeof(cb) === "number"){
						//find by index
						index = cb;
					} else
						//find by callback
						index = ev.indexOf(cb);
					if(index > -1) ev.splice(index, 1);
				},
				triggerEvent: function(eventType){
					var ev = this._cb[eventType], args = Array.prototype.slice.call(arguments);
					if(!ev) return;
					args.shift();
					var res = [];
					ev.forEach( cb => {
						if(cb)
							res.push(cb.apply(undefined, args));
					});
					return res;
				}
			});
		}
		return Eventful;
	}
})();
