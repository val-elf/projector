(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('treeList', TreeListDirective)
		.directive('treeItem', TreeItemDirective)
	;

	function TreeListDirective($compile){
		return {
			restrict: 'E',
			scope: {
				treeNodes: '=',
				children: '@',
				ngSelect: '&'
			},
			require: ['?^rootTreeList', '^treeList', '?ngModel', '?^parentNode'],
			controller: function($scope){
				var id = Math.random();
				angular.extend(this, {
					id: id,
					selected: null, //only in Root controller
					ngModel: null,
					parentNode: null,
					expandAncestors: function(){
						this.parentNode && this.parentNode.expand(true);
					},
					selectNode: function(node){
						if(this.selected != node && this.ngModel){
							this.ngModel.$setViewValue(node);
						}
						this.selected = node;
						$scope.ngSelect();
					}
				})
			},
			controllerAs: 'treeListController',
			compile: function(elem, attr){
				var template = $('<div class="list tree-list"></div>'),
					source = elem.html()
				;
				elem.empty();
				elem.append(template);

				return {
					pre: function(scope, elem, attr, ctrls){
						//elem.remove();
						var tmpl = $(elem[0]).find(".list.tree-list"),
							own = ctrls[1],
							root = ctrls[0] || own,
							ngModelCtrl = ctrls[2],
							parentNode = ctrls[3],
							selectedNode;

						own.parentNode = parentNode;

						if(ngModelCtrl){
							root.ngModel = ngModelCtrl;
							ngModelCtrl.$render = function(){
								root.selectNode(ngModelCtrl.$modelValue);
							}
						}

						function buildTree(){
							tmpl.empty();
							scope.treeNodes && scope.treeNodes.forEach(function(node){
								var sc = scope.$parent.$new();
								sc.item = node;
								sc.children = node.children;
								sc.source = source;
								tmpl.append($compile('<tree-item item="item" source="source" children="children">' + source + '</tree-item>')(sc, undefined,
									{
										transcludeControllers : {
											'treeList': {instance: own},
											'rootTreeList': {instance: root}
										}
									}));
							});
						}
						
						scope.$watch("treeNodes", function(newNodes){
							buildTree();
						})
					}
				};
			}
		}
	}

	function TreeItemDirective($compile){
		return {
			restrict: 'E',
			replace: 'true',
			require: ['^treeList','?^rootTreeList'],
			scope: {
				item: '=',
				children: '=',
				source: '='
			},
			transclude: true,
			templateUrl: 'common/directives/ui/tree-list-item.html',
			compile: function(elem, attrs){
				return function(scope, elem, attrs, ctrls){

					var cldNode = $(elem[0]).find(".children"),
						opener = $(elem[0]).find(".opener"),
						treeList = ctrls[0],
						rootTreeList = ctrls[1] || treeList;

					if(scope.children){
						var treeNodeItem = $compile('<tree-list tree-nodes="children">' + scope.source + '</tree-list>')(scope.$parent.$new(), undefined,
								{
									transcludeControllers : {
										'parentNode': {instance: scope},
										'rootTreeList': {instance: rootTreeList}
									}
								});
						cldNode.append(treeNodeItem);
					}

					setTimeout(function(){
						scope.nodeTitle = $(elem[0]).find(">.row").text().replace(/^\s+|\s+$/g, '');
						scope.$evalAsync();
					});

					angular.extend(scope, {
						treeList: treeList,
						rootTreeList: rootTreeList,
						toggleActive: function(event){
							rootTreeList.selectNode(this.item);
						},
						toggleNode: function(event){
							event.stopPropagation();
							if(opener.attr("disabled")) return;
							elem.toggleClass("open");
						},
						expand: function(withParents){
							if(opener.attr("disabled")) return;
							elem.addClass("open");
							if(withParents){
								treeList.expandAncestors();
							}
						},
						collapse: function(){
							if(opener.attr("disabled")) return;
							elem.removeClass("open");
						},
						isSelected: function(){
							var ovalue = this.selected;
							this.selected = rootTreeList.selected === this.item;
							if(this.selected && !ovalue){
								treeList.expandAncestors();
							}
							return this.selected;
						}
					})
				}
			}
		}
	}
})();
