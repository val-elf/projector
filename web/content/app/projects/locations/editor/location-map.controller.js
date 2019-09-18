(function(){
	'use strict';
	angular.module('projector.controllers')
		.controller('ProjectorLocationMapController', ProjectorLocationMapController)
	;


	function ProjectorLocationMapController($scope,
		$q,
		ViewPort,
		Shape,
		Image,
		MercatorGrid,
		Boundary
	){
		angular.extend(this, {
			items: [],
			mode: null,
			imageId: null,
			viewport: new ViewPort(1, {x: 0, y: 0}),
			boundary:  null,

			checkNearestShapes: function(event){
				var point = {x: event.offsetX, y: event.offsetY};
				this.items.forEach( shape => {
					if(!shape.selected) return;
					if(shape instanceof Shape)
						shape.detectNearestPoint(point, 10);
				});
			},

			createMerchatorGrid: function(){
				var grid = new MercatorGrid(this);
			},

			createNewShape: function(){
				return new Shape(this, null);
			},

			setPaper: function(paper){
				this.paper = paper;
				this.boundary = new Boundary(this);
			},

			addShape: function(shape){
				if(shape){
					this.items.push(shape);
					this._prepareShape(shape);
					if(!this.item.map) this.item.map = [];
					this.item.map.push({shape: shape.points});
				}
				this.createdShape = null;
			},

			process: function(point, tool){
				switch(tool.name){
					case 'pen':
						this.createdShape = tool.processPoint(point);
					break;
					default:
						tool.processPoint(point);
					break;
				}
			},

			cancelDrawing: function(tool){
				tool.cancel();
				this.createdShape = null;
			},

			_prepareShape: function(shape){
				shape.on('controlClick', this.selectControlPoint.bind(this));
				shape.on('select', this.chooseItem.bind(this));
				shape.on("pointDragStart", event => {
					this.mode = "pointMove";
				});
				shape.on("pointDragEnd", event => {
					this.mode = "";
				});
			},

			_prepareImage: function(image){
				image.on("select", this.chooseItem.bind(this));
			},

			_mapToOrigin: function(){
				this.item.map = this.items.map( item => { return item.mapToOrigin();});
			},

			_cleanShapes: function(){
				this.items.forEach( item => item.remove() );
				this.items.splice(0, this.items.length);
			},

			canMakeAction: function(action){
				if(this.editor &&
					this.editor.toolInstance &&
					this.editor.toolInstance.canMakeAction
				)
					return this.editor.toolInstance.canMakeAction(action);
				return true;
			},

			selectControlPoint: function(event, shape){
				if(shape.closed){
					shape.selectPoint(event.point, event.shiftKey);
					event.stopPropagation();
					event.preventDefault();							
				}
			},

			chooseItem: function(event){
				this.boundary.addItem(event.item, event.selected);
			},

			removeSelecteds: function(){
				var removed = this.boundary.removeItems();				
				this.items = this.items.filter(shape => {
					return removed.indexOf(shape) === -1;
				});
				this._mapToOrigin();
			},

			processMap: function(){
				this._cleanShapes();
				if(!this.item.map) this.item.map = [];
				this.items = this.item.map.map( item => {
					var element;
					if(item.shape){
						element = new Shape(this, item.shape);
						this._prepareShape(element);
					} else if( item.image ){
						element = new Image(this, item.image);
						this._prepareImage(element);
					}
					return element;
				});
			}
		});

		if(this.mapMode !== 'parent'){
			$scope.$on('mapUpdate', event => {
				this.item.map = angular.copy(this.item.map);
				this.processMap();
			});
		}



	}	
})();
