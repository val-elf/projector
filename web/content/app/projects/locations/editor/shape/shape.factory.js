(function(){
	'use strict';
	Raphael.el.isHidden = function(){
		return this.node.style.display === 'none';
	}

	angular.module('projector.factories')
		.factory('Shape', ShapeFactory)
	;

	function ShapeFactory($q, Eventful){
		return function(map, shape){
			var paper = map.paper;
			Eventful.call(this);

			if(!shape) shape = [];

			angular.extend(this, {
				controls: [],
				path: paper.path().attr({fill:"violet", stroke: "#EA3500", "stroke-width": 1}),
				wandering: paper.circle().attr({fill: '#B340E3', stroke: '#AE14FA', r: 4}),
				points: shape,
				selectedPoints: [],
				viewport: map.viewport,
				smoothed: false,
				bbox: null,

				_getBBox: function(){
					var zm = this.viewport.getZoom(),
						offs = this.viewport.getOffset()
					;
					this.bbox = this.path.getBBox(false);
					this.bbox.x = (this.bbox.x - offs.x) / zm;
					this.bbox.y = (this.bbox.y - offs.y) / zm;
					this.bbox.width /= zm;
					this.bbox.height /= zm;
				},

				_freshPath: function(){
					if(this.points.length > 2) this.path.attr("path", this.getPathString());
					if(!this.bbox) this._getBBox();
				},

				render: function(){
					this._freshPath();
					if(!this.selected && !this.wandering.isHidden()){
						this.wandering.hide();
					}
					var prevpt;
					this.controls.forEach((control, index) => {
						(this.selected || !this.closed) && control.show() || control.hide();
						var pt = this._toViewCoords(this.points[index]);
						if(prevpt){
							var dx = (pt.x - prevpt.x),
								dy = (pt.y - prevpt.y),
								dist = dx * dx + dy * dy
							;
							if(dist < 100) {
								control.hide();
							} else prevpt = pt;
						} else prevpt = pt;
						control.attr({cx: pt.x, cy: pt.y})
					});
				},
				close: function(){
					this.closed = true;
					this.path.node.setAttribute("class", "closed");
					this.render();
				},

				remove: function(){
					this.path.remove();
					this.wandering.remove();
					this.controls.forEach( control => control.remove() );
					this.controls = [];
					this.points.splice(0, this.points.length);
					this.viewport.off('changeView', this._render);
					this.triggerEvent("change");
				},
				_toViewCoords: function(point){
					var rz = this.viewport.getZoom(),
						ro = this.viewport.getOffset();

					var res = {
						x: !this.viewport ? point.x : point.x * rz + ro.x,
						y: !this.viewport ? point.y : point.y * rz + ro.y
					}
					return res;
				},
				_toRealCoords: function(point){ 
					var ro = this.viewport ? this.viewport.getOffset() : null,
						rz = this.viewport ? this.viewport.getZoom(): 1,
						res = {
							x: !this.viewport ? point.x : (point.x - ro.x) / rz,
							y: !this.viewport ? point.y : (point.y - ro.y) / rz
						}
					;
					return res;
				},
				_getCoordString: function(point){
					var pt = this._toViewCoords(point);
					return pt.x  + "," + pt.y;
				},
				getPathString: function(){
					var res = "";
					this.points.forEach((point, index) => {
						if(index === 0){
							res = "M " + this._getCoordString(point) + " ";
						} else if(index === 1){
							res += (this.smoothed && !this.selected ? "R" : "L") + " " + this._getCoordString(point) + " ";
						} else {
							res += this._getCoordString(point) + " ";
						}
					});
					if(this.closed) res += "Z";
					return res;
				},

				getBoundaryRect: function(){
					return this.bbox;
				},

				applyZoom: function(zoom, force){
					var factor = !this.zf ? 1 : zoom.factor / this.zf;
					this.zf = zoom.factor;

					this.points.forEach( point => {
						var dx = (point.x - zoom.x) * factor,
							dy = (point.y - zoom.y) * factor;
						point.x = zoom.x + dx;
						point.y = zoom.y + dy;
					});

					this.render();

					if(force){
						this._getBBox();
						this.zf = null;
					}
				},

				applyShift: function(shift){
					var factor = map.viewport.getZoom();
					this.points.forEach( point => {
						point.x += shift.x / factor;
						point.y += shift.y / factor;
					});
					this.bbox.x += shift.x / factor;
					this.bbox.y += shift.y / factor;
					this.render();
					this.triggerEvent("change");
				},

				mapToOrigin: function(){
					return { shape : this.points}
				},

				_select: function(value, srcEvent){
					var evt = new Event("select", {cancelable: true});
					evt.item = this;
					evt.selected = value;
					this.triggerEvent("select", evt);
					if(evt.defaultPrevented) return false;
					return this.select(value);
				},
				selectPoint: function(point, addToSelection){
					if(this.selectedPoints.indexOf(point) > -1){

					} else {
						if(addToSelection)
							this.selectedPoints.push(point);
						else
							this.selectedPoints = [point];

						this.controls.forEach( cpoint => {
							if(this.selectedPoints.indexOf(cpoint) > -1){
								cpoint.node.className.baseVal = "control selected";
							}
							else cpoint.node.className.baseVal = "control";
						});
					}
				},
				select: function(value){
					this.selected = value;
					this.defineState();
					this.render();
					return true;
				},
				toggle: function(){
					this.select(!this.selected);
				},		
				toggleSelect: function(event){
					return this._select(!this.selected, event);
				},
				defineState: function(){
					var cls = "";
					if(this.closed) cls += "closed ";
					if(this.selected) cls += "selected ";
					this.path.node.setAttribute("class", cls);
					if(this.selected) {
						this.path.toFront();
						this.wandering.toFront();
						this.controls.forEach( control => control.toFront() );
					}
				},
				_createControlPoint: function(point, index) {
					var res = paper.circle(point.x, point.y, 3).attr({fill: "violet", opacity: 1, stroke: "none", 'class': "control"}),
						dx, dy, fd = true;
					;
					res.node.setAttribute("class", "control");
					this.controls.splice(index, 0, res);

					res.drag((x, y, psx, psy, event) => {
						var nx = dx + x,
							ny = dy + y
						;
						res.attr({cx: nx, cy: ny});
						index = this.controls.indexOf(res);
						angular.extend(this.points[index], this._toRealCoords({x: nx, y: ny}) );
						this.render();
						event.stopPropagation();
						event.preventDefault();
					}, (x, y) => {
						dx = res.attr("cx");
						dy = res.attr("cy");
						fd = false;
						this.triggerEvent("pointDragStart", event, this);
					}, () => {
						this.triggerEvent("pointDragEnd", new Event("pointDragEnd", {}), this);
						this.triggerEvent("change", new Event("change"));
					});

					res.click(event => {
						event.point = res;
						this.triggerEvent("controlClick", event, this);
					});

					return res;
				},
				detectNearestPoint: function(toPoint, radius){
					var mindist;

					toPoint = this._toRealCoords(toPoint);
					radius = this.viewport ? radius / this.viewport.getZoom() : radius;

					function sqr(d){return d * d;}
					function distance2(p1, p2){ return sqr(p1.x - p2.x) + sqr(p1.y - p2.y);}
					function distance(p1, p2){ return Math.sqrt(distance2(p1, p2));}
					function getK(p1, p2) { return p2.x === p1.x ? undefined: (p2.y - p1.y) / (p2.x - p1.x); }
					function getB(p, k) {return p.y - k * p.x; }
					function getCross(p0, p1, p2){
						var k = getK(p1, p2),
							ks = k === undefined ? 0 : k === 0 ? undefined : -1/k,
							b = k === undefined ? 0 : getB(p1, k),
							bs = ks === undefined ? 0 : getB(p0, ks),
							x = k === undefined ? p1.x
								: k === 0 ? p0.x
								: (bs - b) / (k + 1/k)
						;

						var res = {						
							x: x,
							y: k !== undefined ? k * x + b : p0.y
						}
						var r = distance2(p1, p2)
						if(distance2(p1, res) > r || distance2(p2, res) > r) return null;
						return res;
					}

					function inZone(p, p1, p2, radius){//returns true, if  p1-p2 in p0 zone
						//check for zone1
						if(p1.x < p.x - radius && p2.x < p.x - radius) return false;
						if(p1.y < p.y - radius && p2.y < p.y - radius) return false;
						if(p1.x > p.x + radius && p2.x > p.x + radius) return false;
						if(p1.y > p.y + radius && p2.y > p.y + radius) return false;
						return true;
					}

					if(this.points.length < 2) return;
					var cp, ld, psd = [], lp, rp,
							lind, rind;
					this.points.forEach((p1, index) => {
						if(this.points.length === 2 && index === 1) return;
						var ind2 = this.points.length - 1 > index ? index + 1 : 0,
							p2 = this.points[ind2];

						if(!inZone(toPoint, p1, p2, radius)) return;

						psd.push([p1,p2]);

						this.path.getSubpath(p1, p2)
						var crossPoint = getCross(toPoint, p1, p2);
						if(!crossPoint) return;
						var dist = distance(toPoint, crossPoint);
						if(dist < radius && (!cp || dist < ld)) {
							cp = crossPoint;
							ld = dist;
							lp = p1;
							rp = p2;
							lind = index;
							rind = ind2;
						}
					});
					if(cp){
						this.segment = {point: cp, left: lp, right: rp, lind: lind, rind: rind};
						cp = this._toViewCoords(cp);
						if(this.wandering.isHidden()) this.wandering.show();
						this.wandering.attr({cx: cp.x, cy: cp.y});
					} else {
						if(!this.wandering.isHidden()) this.wandering.hide();
						this.segment = null;
					}
				},
				addEndPoint: function(point){
					this._createControlPoint(point, this.points.length);
					this.points.push(this._toRealCoords(point));
					if(this.controls.length === 1){
						this.controls[0].click(event => { // when click on start point for closing path
							if(this.closed) return;

							event.stopPropagation();
							event.preventDefault();

							var evt = new Event("firstPointClick", event);
							var prms = this.triggerEvent("closePath", evt, prms);
							$q.all(prms).then( ()=>{
								if(!evt.defaultPrevented)									
									this.addEndPoint({
										x: event.offsetX,
										y: event.offsetY
									});
							});
						});
					}
					this.triggerEvent("change", new Event("change"));

					this.render();
				},
				addPointOnLine: function(segment){
					var point = {
						x: segment.point.x,
						y: segment.point.y
					};

					this.points.splice(segment.lind + 1, 0, point);
					this._createControlPoint(point, segment.lind + 1);
					this.triggerEvent("change", new Event("change"));
					this.render();
				}
			});
			var clickProc = event => {
				if(this.closed){
					if(!wasmove && this.toggleSelect(event)){
						event.stopPropagation();
					} else if(wasmove) event.stopPropagation();
				}
			};
			var wasmove = false,
				_dragInfo = {},
				dragFunc = (function(){
					var args = Array.prototype.slice.call(arguments),
						event = args.pop();
						switch(event.type){
							case "mousedown":
								wasmove = false;
								_dragInfo.dx = 0;
								_dragInfo.dy = 0;
							break;
							case "mousemove":								
								if(this.selected){
									var ax = args[0],
										ay = args[1],
										dx = ax - _dragInfo.dx,
										dy = ay - _dragInfo.dy
									;
									if(map.canMakeAction("drag"))
										this.applyShift({x: dx, y: dy});

									_dragInfo.dx = ax;
									_dragInfo.dy = ay;
									wasmove = ax * ax + ay * ay > 4;
								}
							break;
							case "mouseup":
							break;
						}
					;
				}).bind(this),
				drd = [dragFunc, dragFunc, dragFunc]
			;
			this.path.click(clickProc).touchend(clickProc);
			this.path.drag.apply(this.path, drd);
			this.path.mousedown( event => {
				var evt = new Event("shapemousedown", {cancelable: true});
				evt.item = this;
				//event.stopPropagation();
				this.triggerEvent("mousedown", evt);
			});
			this.wandering.click( event => {
				if(this.segment){
					event.preventDefault();
					event.stopPropagation();
					this.addPointOnLine(this.segment);
				}
			});
			this.wandering.toFront();
			if(shape.length){
				shape.forEach( (point, index) => this._createControlPoint(point, index));
				this.close();
			}

			this._render = this.render.bind(this);

			this.viewport.on('changeView', this._render);
		}
	}
})();


