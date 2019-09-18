(function(){
	'use strict';

	angular.module('projector.controllers')
		.controller('ProjectorLocationEditorController', ProjectorLocationEditorController)
	;


	function ProjectorLocationEditorController($scope, $q, modal, alert, Shape, ViewPort){

		angular.extend(this, {
			mode: null,
			maps: [],
			currentTool: 'pen',
			toolInstance: null,
			tools: {},
			viewport: new ViewPort(1, {x: 0, y: 0}),

			startDrag: function(x, y, event){
				var vp = this.mode === 'parentMap' ? this.parent.getViewPort() : this.viewport;
				this.toolInstance.startDrag && this.toolInstance.startDrag(x, y, event, vp);
			},

			setWorkingMap: function(map){
				this.workingMap = map;
			},

			canSelectShape: function(event){
				if( (this.toolInstance.name === 'pen' && this.toolInstance.inProgress())
					|| this.toolInstance.name === 'pane' && this.toolInstance.state === 'drag' 
					|| this.checkTouchMode('pan') || this.checkTouchMode('zoom')
				) {
					event.preventDefault();
					return false;
				}
				return true;
			},

			drag: function(x, y, event){
				if(this.mode === "pointMove") return;
				var vp = this.mode === 'parentMap' ? this.parent.getViewPort() : this.viewport;
				this.toolInstance.drag && this.toolInstance.drag(x, y, event, vp);
			},

			stopDrag: function(){
				this.toolInstance.stopDrag && this.toolInstance.stopDrag();
			},

			selectTool: function(toolName){
				if(this.currentTool !== toolName){
					this.currentTool = toolName;
					//if(this.toolInstance) this.toolInstance.destroy();
					this.toolInstance = this.tools[toolName];
					if(!this.toolInstance){
						switch(this.currentTool){
							case 'pen': this.toolInstance = new PenTool(this, $q); break;
							case 'pane': this.toolInstance = new PaneTool(this, $q); break;
							case 'add': this.toolInstance = new AddItemTool(this, $q); break;
						}
						this.tools[toolName] = this.toolInstance;
					}
				}
			},

			showNeighbors: function(show){
				if(this.parent){
					if(show){
						this.parent.loadChildren().then(children => {
							children.forEach(child => {
								if(child._id === this.location._id) return;
								this.parent.map = this.parent.map.concat(child.map);
							});
						});
					} else {
					}
				}
			},

			moveZoom: function(x, y, zoom){
				this.applyZoom(zoom, {x: x, y: y, deltaX: 0, deltaY: 0});
			},

			applyZoom: function(zoomMultipler, zoomPoint) {
				if(this.mode === 'parentMap' && this.parent){
					var vp = this.parent.getViewPort();
					if(vp){
						vp.applyZoomMultiplyer(zoomMultipler, zoomPoint);
						this.location.parent.scale = vp.zoomFactor;
						this.parent.scale = vp.zoomFactor;
						this.location.parent.position = angular.extend({}, vp.panOffset);
	 					$scope.$evalAsync();
	 				}
				} else
					this.viewport.applyZoomMultiplyer(zoomMultipler, zoomPoint);
			},

			setParentMapMode: function(value){
				this.mode = value && this.parent ? 'parentMap' : null;
			},			

			processPoint: function(point){
				this.workingMap.process(point, this.toolInstance);
			},

			processClosePath: function(event){
				return alert({
					isConfirm: true,
					message: 'Закрыть путь?'
				}).then(value =>{
					if(value){
						event.preventDefault();
						this.stopDrawing();
					}
				})
			},

			deleteSelectedShapes: function(){
				this.workingMap.removeSelecteds();
			},

			addMap: function(mapCtrl){
				this.maps.push(mapCtrl);
				mapCtrl.viewport.setOwnViewPort(this.viewport);
			},

			/*combineShapes: function(){
				if(this.selecteds.length > 1){
					var st = this.paper.set();
					this.selecteds.forEach( shape => {
						st.push( shape.path );
					});
					st.attr({fill: '#AA0000'});
					console.log("ST = ", st);
				}
			},*/

			spaceDown: function(){
				if(this.currentTool === 'pane') return;

				this._ptoolname = this.currentTool;
				this.selectTool('pane');
				$scope.$evalAsync();
			},

			spaceRelease: function(){
				if(this._ptoolname){
					this.selectTool(this._ptoolname)
					this._ptoolname = null;
					$scope.$evalAsync();
				}
			},

			enterPressing: function(){
				if(this.toolInstance instanceof PenTool) this.toolInstance.finishShape();
			},

			stopDrawing: function(){
				var shape = this.toolInstance.stopDrawing();
				this.workingMap.addShape(shape);
			},

			cancelDrawing: function(){
				this.workingMap.cancelDrawing(this.toolInstance);				
			},

			init: function(){
				this.location.scale && this.viewport.setViewPoint(this.location.scale || 1, this.location.position || {x: 0, y: 0});
				this.viewport.on('changeView', () => {
					this.location.scale = this.viewport.zoomFactor;
					this.location.position = angular.extend({}, this.viewport.panOffset);
				});
			}
		});

		this.toolInstance = new PenTool(this, $q);
		this.tools['pen'] = this.toolInstance;
	}
})();
