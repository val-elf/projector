(function(){
	'use strict';
	angular.module('projector.services')
		.service("Boundary", ProjectorBoundaryService)
	;


	function ProjectorBoundaryService(Eventful){
		var Boundary = function(map){
			Eventful.call(this);

			var paper = map.paper,
				vp = map.viewport,
				rnd = event => { this.render(); }

			map.viewport.on('changeView', event=>{
				this.render();
			})

			angular.extend(this, {
				items: [],
				map: map,
				rect: paper.rect().attr({"stroke": "#000000"}),
				corners: [],
				set: paper.set(),
				addItem: function(item, isAdd){
					var ind = this.items.indexOf(item);
					if(isAdd && ind  === -1){
						this.items.push(item);
						item.on('change', rnd);
					} else if(!isAdd && ind > -1){
						this.items.splice(ind, 1);
						item.off('change', rnd);
					}
					this.render();
				},

				getBoundaryRect: function(){
					if(this.mode === "drag"){
						return this.boundary;
					}
					if(!this.items.length) return null;
					var res = null;
					this.items.forEach( item => {
						var bnd = item.getBoundaryRect();
						if(!res && bnd) {
							res = {
								l: bnd.x,
								t: bnd.y,
								r: bnd.x + bnd.width,
								b: bnd.y + bnd.height
							};
						} else if(res && bnd){
							if(res.l > bnd.x) res.l = bnd.x;
							if(res.t > bnd.y) res.t = bnd.y;
							if(res.r < bnd.x + bnd.width) res.r = bnd.x + bnd.width;
							if(res.b < bnd.y + bnd.height) res.b = bnd.y + bnd.height;
						}
					});
					res = {
						x: res.l,
						y: res.t,
						width: res.r - res.l,
						height : res.b - res.t
					};
					return res;
				},

				render: function(){
					this.boundary = this.getBoundaryRect();
					if(!this.boundary){
						this.set.hide();
						return;
					}
					this.set.show();
					var offs = vp.getOffset(), zf = vp.getZoom(),
						px = this.boundary.x * zf + offs.x - 10,
						py = this.boundary.y * zf + offs.y - 10,
						xwidth = this.boundary.width * zf + 20,
						xheight = this.boundary.height * zf + 20,
						pt = {
							x: px,
							y: py,
							width: xwidth,
							height: xheight
						};
					this.rect.attr(pt);
					this.corners.forEach ( (corner, index) => {
						corner.attr({x: px - 5 + (index % 2) * xwidth, y: py - 5 + (Math.floor(index / 2) % 2 ) * xheight });
					});
					this.set.toFront();
				},

				removeItems: function(){
					var removed = this.items;
					this.items.forEach( item=> item.remove() );
					this.items = [];
					this.render();
					return removed;
				},

				applyZoom: function(corner, force){
					var boundary = this.boundary,
						zoom = {
							factor : boundary.zoom,
							x: boundary.x,
							y: boundary.y
						}
					;
					switch(corner){
						case 0: 
							zoom.x = boundary.width + boundary.x;
							zoom.y = boundary.height + boundary.y;
						break;
						case 1:
							zoom.y = boundary.height + boundary.y;
						break;
						case 2:
							zoom.x = boundary.width + boundary.x;
						break;
					}
					this.items.forEach( item => item.applyZoom(zoom, force) );
				}
			});

			(() => { //configure selector
				var boundaryColor = "#000000",
					attrs = {stroke: boundaryColor, 'stroke-width': 1}, bx, by, bz, ow, oh,
					cornerMove = (corner) => {
						return (function() {
							var args = Array.prototype.slice.call(arguments);
							var event = args.pop();

							var getZoom = () => {
								var zoomx = this.boundary.width / ow,
									zoomy = this.boundary.height / oh
								;
								return zoomx > zoomy ? zoomy : zoomx;
							}

							switch(event.type){
								case "mousedown": //start drag
									bx = args[0];
									by = args[1];
									bz = map.viewport.getZoom();
									this.mode = "drag";
									ow = this.boundary.width;
									oh = this.boundary.height;
								break;
								case "mousemove": //move drag
									var deltax = args[2] - bx,
										deltay = args[3] - by;
									this.boundary.dx = deltax / bz;
									this.boundary.dy = deltay / bz;
									this.boundary.corner = corner;
									switch(corner){
										case 0:
											this.boundary.x += deltax / bz;
											this.boundary.y += deltay / bz;
											this.boundary.width += -deltax / bz;
											this.boundary.height += -deltay / bz;
										break;
										case 1:
											this.boundary.y += deltay / bz;
											this.boundary.width += deltax / bz;
											this.boundary.height += -deltay / bz;
										break;
										case 2:
											this.boundary.x += deltax / bz;
											this.boundary.height += deltay / bz;
											this.boundary.width += -deltax / bz;
										break;
										case 3:
											this.boundary.width += deltax / bz;
											this.boundary.height += deltay / bz;
										break;
									}
									this.boundary.zoom = getZoom();
									bx = args[2]; by = args[3];
									this.applyZoom(corner);
									this.render();
								break;
								case "mouseup": //end drag
									this.mode = null;
									var zoom = getZoom();
									this.boundary.deltaZoom = zoom - this.boundary.zoom;
									this.boundary.zoom = zoom;
									this.applyZoom(corner, true);
									this.render();
								break;
							}
						}).bind(this);
					};

				attrs.fill = "#000000";
				this.set.push(this.rect);
				this.corners = new Array(0,1,2,3).map( ind => {return paper.rect(0, 0, 10, 10);} );
				this.corners.forEach( (corner, index) => {
					corner
						.attr(attrs)
						.drag(cornerMove(index), cornerMove(index), cornerMove(index))
						.click( event => event.stopPropagation() )
					;
					this.set.push(corner)
				});
				this.set.hide();
			})();
		};


		return Boundary;
	}

})();
