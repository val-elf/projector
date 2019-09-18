(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjTabset', ProjectorTabset)
		.directive('pjTab', ProjectorTab)
		.directive('pjTabview', ProjectorTabview)
	;


	function ProjectorTabset($compile){
		return {
			restrict: 'E',
			replace: true,
			controller: function($scope){
				angular.extend(this, {
					tabs: [],
					tabPanes: [],
					contentNode: null,

					actualize: function(){
						if(this.savePosition && this.tabId){
							var index = parseInt(window.localStorage.getItem('_tabPosition:' + this.tabId));
							if(this.tabs[index]) this.setActive(this.tabs[index]);
						}
					},
					registryContent: function(contentBox){						
						this.contentNode = $('<div>');
						this.contentNode.addClass('tab-pane active');
						this.contentNode.append(contentBox);
					},
					registryTab: function(tab, transcluder){
						this.tabs.push(tab);
						transcluder($scope, (function(clone){
							var tabPane = $compile('<div class="tab-pane" ng-class="{active: current}"></div>')(tab);
							tabPane.append(clone);
							this.tabPanes.push(tabPane);
						}).bind(this));
					},					
					setActive: function(tab){
						this.tabs.forEach(function(tb, index){
							tb.current = tb === tab;
							if(tb.current && this.savePosition && this.tabId) {
								window.localStorage.setItem('_tabPosition:' + this.tabId, index);
							}
						}, this); 
					}
				});
			},
			transclude: true,
			template: function(elm, attr){
				return '<div class="tabset tab ' + (attr['class']) + (attr.vertical === 'true' ? ' vertical' : '') + '"><ul class="nav-tabs" ng-transclude></ul><div class="tab-content"></div></div>';
			},
			compile: function(elem, attr){
				return function link(scope, elem, attr, pjTabsetController){
					var contentPlaceholder = $(elem[0]).find("div.tab-content");
					scope.contentPlaceholder = contentPlaceholder;
					pjTabsetController.savePosition = attr.savePosition === "true";
					pjTabsetController.tabId = attr.tabId;

					if(pjTabsetController.savePosition && pjTabsetController.tabId) pjTabsetController.actualize();

					if(pjTabsetController.contentNode){
						scope.contentPlaceholder.append(pjTabsetController.contentNode);
					}
					else if(pjTabsetController.tabPanes.length)
						pjTabsetController.tabPanes.forEach(function(tp){
							contentPlaceholder.append(tp);
						});
				}
			}
		}
	}

	function ProjectorTab(){
		return {
			restrict: 'E',
			scope: {
				heading: '=',
				state: '=',
				params: '=',
				active: '='
			},
			require: '^pjTabset',
			replace: true,
			transclude: true,
			template: '<li class="tab" ng-click="select()" ng-class="{active: current}"><a href>{{heading}}</a></li>',
			controller: function($scope, $state){
				$scope.select = function(){
					if(this.state) $state.go(this.state, this.params);
					this.tabSet && this.tabSet.setActive($scope);
				}
			},
			link: function(scope, elem, attr, tabSet, transclude){
				tabSet && tabSet.registryTab(scope, transclude);
				scope.tabSet = tabSet;
				scope.current = scope.active;
			}
		};
	};

	function ProjectorTabview(){
		return {
			restrict: 'E',
			replace: true,
			require: '^?pjTabset',
			link: function(scope, elem, attr, tabset){
				if(tabset){
					//var nd = $('<div>').addClass("tab-pane");
					//elem.wrap(nd);
					tabset.registryContent(elem);
				}
			}
		};
	};

})();