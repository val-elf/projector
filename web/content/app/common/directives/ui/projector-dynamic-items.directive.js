(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjDynamicList', ProjectorDynamicList)
		.directive('pjDynamicItem', ProjectorDynamicItem) //not for user manually
	;

	function ProjectorDynamicList($compile){
		return {
			restrict: 'E',
			replace: true,
			require: ['?ngModel','pjDynamicList'],
			controller: ProjectorDynamicListController,

			compile: function(elem, attr){
				var template = elem.html();

				return function(scope, elem, attr, ctrls, transcludeFn){
					var own = ctrls[1],
						body = $(['<div class="dynamic-list list">',
										'<div class="items-container">',
											'<div class="item" ng-repeat="element in data"><pj-dynamic-item item="element"></pj-dynamic-item></div>',
										'</div>',
										'<div class="template item"></div>',
									'</div>'].join('')),

						containerHolder = body.find(".items-container"),
						templateHolder = body.find(".template"),
						templateScope = scope.$new();
					;
					own.template = template;
					templateScope.item = {};

					elem.parent().append($compile(body)(scope, undefined,
							{
								transcludeControllers : {
									'pjDynamicList': {instance: own}
								}
							}));
					elem.remove();

					templateHolder.append($compile('<div ng-disabled="_isEmpty(item)"><div class="brick holder">' + template + '</div>&nbsp;<div class="icon16 add" ng-click="addNewItem()"></div></div>')(templateScope));
					own.ngModelCtrl = ctrls[0];

					if(own.ngModelCtrl){
						own.ngModelCtrl.$render = function(){
							scope.data = [].concat(own.ngModelCtrl.$modelValue);
							var templateItem = scope.data.pop();
							templateScope.item = templateItem;
						}
					}

					function copyScopeAndClean(scope){
						var obj = {};
						Object.keys(scope).forEach(function(vkey){
							if(vkey[0] != '$'){
								obj[vkey] = scope[vkey];
								scope[vkey] = null;
							}
						});
						return obj;
					}

					scope.$watch(
						function(){ return scope._isEmpty(templateScope.item); },
						function(value){ 
							scope._actualizeModel(); 
						}
					);

					angular.extend(scope, {
						data: [],
						removeItem: function(item){
							var indOf = this.data.indexOf(item);
							if(indOf > -1) this.data.splice(indOf, 1);
							this._actualizeModel();
						},
						_isEmpty: function(item){
							function emptyFields(){
								return !Object.keys(item).some(function(key){
									return !!item[key];
								});
							}
							return !templateScope.item || angular.equals({}, item) || emptyFields();
						},
						_actualizeModel: function(){
							if(!own.ngModelCtrl) return;

							var viewValue = [].concat(this.data.filter(function(item){
								return !this._isEmpty(item)
							}, this));
							if(!this._isEmpty(templateScope.item)) viewValue.push(templateScope.item);
							own.ngModelCtrl.$setViewValue(viewValue);
						},
						addNewItem: function() {
							if(this._isEmpty(templateScope.item)) return;
							this.data.push(angular.extend({}, templateScope.item));
							templateScope.item = {};
							this._actualizeModel();
						}
					});
				}
			}
		}
	}

	function ProjectorDynamicListController($scope, $compile){
		angular.extend(this, {
			template: null,
			renderItem: function(scope){
				return $compile('<div>' + this.template + '<div class="icon16 hovered remove" ng-click="$parent.removeItem(item)"></div></div>')(scope);
			}
		})
	}

	function ProjectorDynamicItem($compile){
		return {
			restrict: 'E',
			require: '^pjDynamicList',
			scope: {
				item: '='
			},
			replace: true,
			compile: function(elem, attr){
				return function(scope, elem, attr, dynamicListCtr){
					elem.parent().append(dynamicListCtr.renderItem(scope));
					elem.remove();
				}
			}
		}
	}
})();