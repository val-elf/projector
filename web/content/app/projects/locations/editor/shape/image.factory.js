(function(){
	'use strict';

	angular.module('projector.services')
		.factory('Image', ImageFactory)
	;

	function ImageFactory(Eventful){
		var Image = function(map, data){
			Eventful.call(this);

			angular.extend(this, {
				file: data._file,
				x: data.x,
				y: data.y,

				width: data.width,
				height: data.height,
				zoom: data.zoom,
				image: map.paper.image('/srv/file/' + data._file, data.x, data.y, data.width, data.height),
				overrect: map.paper.rect(data.x, data.y, data.width, data.height).attr({opacity: 0.3, fill:"#0066FF"}),
				selected: false,
				mapData: function(){
					data.x = this.x;
					data.y = this.y;
					data.zoom = this.zoom;
				},
				getBoundaryRect: function(){
					return {
						x: this.x,
						y: this.y,
						width: this.width * this.zoom,
						height: this.height * this.zoom
					};
				},
				remove: function(){
					this.image.remove();
					this.overrect.remove();
				},
				applyZoom: function(zoom, force){
					var oz = this.zoom,
						ox = this.x,
						oy = this.y;
					this.zoom *= zoom.factor;
					var dx = (this.x - zoom.x) * zoom.factor,
						dy = (this.y - zoom.y) * zoom.factor
					;
					this.x = zoom.x + dx;
					this.y = zoom.y + dy;

					freshView(map.viewport);
					if(force)
						this.mapData();
					else {
						this.zoom = oz;
						this.x = ox;
						this.y = oy;
					}
				},

				mapToOrigin: function(){
					this.mapData();
					return { image: data };
				}
			});

			var freshView = (vp) => {
				if(!vp) vp = map.viewport;
				var offset = vp.getOffset(), bz = vp.getZoom(),
					zoom = bz * this.zoom;
				var x = this.x * bz + offset.x,
					y = this.y * bz+ offset.y,
					width = zoom * this.width,
					height = zoom * this.height,
					loc = {x: x, y: y, width: width, height: height}
				;
				this.image.attr(loc);
				this.overrect.attr(loc);
				this.image.attr({"opacity": this.selected ? 0.3 : 1});
				if(!this.selected) this.overrect.hide(); else this.overrect.show();
			}

			map.viewport.on('changeView', freshView);

			var wasmoved = false,
				_dragInfo = {},
				dragproc = (function() {
					var args = Array.prototype.slice.call(arguments),
					event = args.pop();
					switch(event.type){
						case "mousemove":
							if(this.selected){
								var dx = args[0],
									dy = args[1],
									factor = map.viewport.getZoom()
								;
								if(map.canMakeAction("drag")){
									this.x = _dragInfo.x + dx / factor;
									this.y = _dragInfo.y + dy / factor;
									freshView();								
									this.triggerEvent("change");
								}
								wasmoved = dx * dx + dy * dy > 4;									
								event.stopPropagation();
							}
						break;
						case "mousedown":
							wasmoved = false;
							_dragInfo.x = this.x;
							_dragInfo.y = this.y;
						break;
						case "mouseup":
							this.mapData();
							this.triggerEvent("change");
						break;
					}
				}).bind(this), dpm = [dragproc, dragproc, dragproc],
				clickProc = event => {
					if(!wasmoved){
						var evt = new Event("select", {cancelable: true});
						evt.item = this;
						evt.selected = !this.selected;
						this.triggerEvent("select", evt);
						if(evt.preventedDefault){
							event.stopPropagation();
							return;
						}				
						this.selected = !this.selected;
						freshView();
					}
					event.stopPropagation();						
				};


			this.overrect.click(clickProc);
			this.overrect.drag.apply(this.overrect, dpm);
			this.image.click(clickProc);
			this.image.drag.apply(this.image, dpm);

			map.viewport.triggerEvent("changeView", map.viewport);
		}

		return Image;
	}

})();
