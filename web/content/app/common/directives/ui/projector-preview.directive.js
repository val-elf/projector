(function(){
	'use strict';
	angular.module('projector.directives')
		.directive('pjPreview', ProjectorPreviewDirective)
		.controller('ProjectorPreviewController', ProjectorPreviewController)
	;

	function ProjectorPreviewDirective(){
		return {
			restrict: 'E',
			scope: {
				item: '=',
				showInfo: '=',
				maxHeight: '@',
				height: '@',
				width: '@',
				defaultIcon: '@',
				placeType: '@',
				openFileInfo: '&',
				expanded: '='
			},
			replace: true,
			templateUrl: 'common/directives/ui/projector-preview.html',
			controller: 'ProjectorPreviewController as previewCtrl',
			require: 'pjPreview',
			link: function(scope, elem, attrs, vm){

				var item = scope.item,
					ext = '*',
					pinfo,
					showFileInfo,
					finfo;
				;
				//item can be document, project, user etc. 
				vm.height = scope.height;
				vm.width = scope.width;
				vm.item = scope.item;

				elem.on('mouseenter', function(){
					if(!finfo) return;
					showFileInfo = setTimeout(function(){
						vm.showFileInfo = true;
						showFileInfo = null;
						finfo.css({top: 20});
						scope.$evalAsync();
					}, 1000);
					finfo.css({top: vm.height});
					if(scope.expanded){
						vm.expanded = true;
						scope.$evalAsync();
					}
				});

				elem.on('mouseleave', function(){
					if(showFileInfo){
						clearTimeout(showFileInfo);
					} else vm.showFileInfo = false;
					vm.expanded = false;
					scope.$evalAsync();
				});


				if(!vm.height && pinfo && pinfo.height) vm.height = pinfo.height;

				function getPreviewInfoString(){

					var item = scope.item;
					if(!item) return;

					if(item._file) item = item._file;
					pinfo = item.preview && typeof(item.preview)==="object" && item.preview || item;
					if(!pinfo) return;

					finfo = $(elem[0]).find(".file-info");

					vm.metadata = scope.item && scope.item.metadata;
					vm.source = item;
					vm.previewInfo = pinfo;
					vm.previewUrl = pinfo.previewUrl;
					vm.preview = pinfo.preview;
					vm.type = pinfo !== item && pinfo.type || item._coretype;//'image/' + ext;


					var mediaType = vm.metadata && vm.metadata.mediatype ? vm.metadata.mediatype : 
										vm.metadata && vm.metadata.type ? vm.metadata.type.split(/\//)[0] : 
										vm.type ? vm.type.split(/\//)[0]: 'unknown';

					if(!scope.height) vm.height = pinfo.height;
					if(!scope.width) vm.width = pinfo.width;

					if(scope.width && !scope.height && pinfo.width && pinfo.height)
						vm.height = pinfo.height * scope.width / pinfo.width;
					else if(scope.width) vm.height = scope.width;
					if((scope.height || scope.maxHeight) && !scope.width)
						vm.width = pinfo.width * (scope.height || scope.maxHeight) / pinfo.height;

					if(!pinfo.preview && !pinfo.previewUrl && !scope.defaultIcon) {						
						scope.defaultIcon = "unknown";
						if(scope.showInfo) scope.showInfo = false;

						detectIcon();

						function detectIcon(){							
							switch(mediaType){
								case 'image':
									scope.defaultIcon = "image";
									break;
								case 'video':
									scope.defaultIcon = "video";
									break;
								case 'audio':
									scope.defaultIcon = "audio";
									break;
								case 'application':
									switch(vm.metadata.subtype){
										case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
											scope.defaultIcon = 'document';
										break;
									}
								break;
								case 'artifacts':
									scope.defaultIcon = 'artifact';
								break;
								case 'characters':
									scope.defaultIcon = 'character';
								break;
								case 'base64':
									scope.defaultIcon = 'document';
								break;
								case 'locations':
									scope.defaultIcon = 'location ' + item.locationType;
								break;
							}
						}

						if(mediaType === 'locations') scope.$watch("item.locationType", detectIcon);
					}
				}

				scope.$watch("item.preview", getPreviewInfoString);
				scope.$watch("item", getPreviewInfoString);

			}
		}
	}

	function ProjectorPreviewController($scope){}

})();
