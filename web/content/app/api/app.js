app = {
	config: {
		infinityAdd: 5
	},

	showLoader: function(value, node){
		this.loader && this.loader.showLoader(value, node);
	}
};

(function(){
	var
		api = angular.module('projector.api', []),
		filters = angular.module('projector.filters', []),
		controolers = angular.module('projector.controllers', []),
		directives = angular.module('projector.directives', []),
		services = angular.module('projector.services', ['ngResource']),
		factories = angular.module('projector.factories', []),
		constants = angular.module('projector.constants', [])
	;

	app.application = angular.module('projector',[
		'ngRoute',
		'ngCookies',
		'ui.router',
		'ui.router.router',
		'ui.bootstrap',
		'restangular',
		'projector.api',
		'projector.filters',
		'projector.directives',
		'projector.controllers',
		'projector.services',
		'projector.factories',
		'projector.settings',
		'projector.projects',
		'projector.files',
		'projector.constants',
		'base64',
		'utf8-base64'
	]);


	app.application
		.config(function(datepickerPopupConfig, $httpProvider, RestangularProvider, base64){
			datepickerPopupConfig.datepickerPopup = "dd MMM yyyy";

			function prepareObject(obj){
				function detectValue(source){
					if(angular.isString(source) && source.match(/\d+\-\d{2}\-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)){
						return new Date(source);
					} else if (angular.isObject(source)) {
						prepareObject(source);
					} else if (angular.isArray(source)) {
						source = source.map(function(value){
							return detectValue(value);
						});
					}
					return source;
				}

				Object.keys(obj).forEach(function(i){
					if (angular.isObject(obj[i])){
						prepareObject(obj[i]);
					} else if (angular.isArray(obj[i])){
						obj[i] = obj[i].map(function(el){
							return detectValue(el);
						})
					} else 
						obj[i] = detectValue(obj[i]);
				});
			}

			RestangularProvider.setBaseUrl('/srv');

			RestangularProvider.setResponseExtractor(function(response, operation, item, route){
				//console.log("res end", response, operation, item, route)
				if(operation === 'getList' && response.data){
					var newResp = [].concat(response.data);
					prepareObject(newResp);
					newResp._ = response._;
					return newResp;
				} else if(operation === 'get') {
					prepareObject(response);
					return response;
				} else if( operation ==='post') {
				} else if ( operation === 'put') {
				}
 				return response;
			});

			RestangularProvider.setRequestInterceptor(function(elem, operation, item, route){
				//console.log("res start", elem, operation, item, route);
 				if (operation === 'remove') {
 					return undefined;					
				} else if (operation === 'post') {
					if(route.match(/owner\/[0-9a-f]+\/documents$/) && elem.metadata.type === 'base64/html')
						elem.content = elem.content && base64.encode(elem.content) || '';
				} else if (operation ==='put') {
					if(elem._coretype === 'documents')
						elem.content = elem.content && base64.encode(elem.content) || '';
				}
				return elem;
			});
			RestangularProvider.setParentless(['timespots']);

			/*RestangularProvider.addElementTransformer('timelines', false, function(timeline){
				return timeline;
			});*/

			RestangularProvider.addElementTransformer('documents', false, function(doc){
				if(doc.fromServer){
					if(doc.metadata.type === 'base64/html' && doc.content){
						try{
							doc.content = doc.content && base64.decode(doc.content) || doc.content;
						} catch(exp){}
					}
				}
				return doc;
			});



			RestangularProvider.setRestangularFields({
				id: "_id"
			});

		})
	;

	filters
		.filter('log', function(){
			return function(value){
				var args = Array.prototype.slice.call(arguments);
				args.unshift("LOG:");
				console['log'] && console.log.apply(console, args);
			}
		});
})();