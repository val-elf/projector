(function(){
	angular.module('projector.factories')
		.factory('ViewPort', ViewPortFactory)
	;

	//ViewPort is Eventful and supports next events:
		// changeView - changing view options, such as zoom, pan position, rotation (hehe) etc.
	function ViewPortFactory(Eventful){
		return function(scale, offset){
			angular.extend(this, Object.create(Eventful));
			Eventful.call(this);

			var res = angular.extend(this, {
				panOffset: angular.extend({x: 0, y: 0}, offset),
				zoomFactor: scale,
				_own: null,
				_children: [],
				setOwnViewPort: function(viewport){
					this._own = viewport;
					this._own.addChild(this);
				},
				setViewPoint: function(zoom, point){
					this.zoomFactor = zoom;
					this.panOffset = point;
					this.apply();
				},
				addChild: function(viewport){
					this._children.push(viewport);
				},
				getZoom: function(){
					return (this._own ? this._own.getZoom() : 1) * this.zoomFactor;
				},
				setOffsetDelta: function(delta){
					var zf = this.zoomFactor,
						dx = delta.x / zf,
						dy = delta.y / zf
					;

					this.panOffset.x += dx;
					this.panOffset.y += dy;
				},
				setOffset: function(offset){
					var ox = this._own ? this._own.panOffset.x : 0,
						oy = this._own ? this._own.panOffset.y : 0,
						zf = this.zoomFactor,
						zo = this._own ? this._own.zoomFactor : 1
					;					
					this.panOffset.x = (offset.x / zo - ox) / zf;
					this.panOffset.y = (offset.y / zo - oy) / zf;
					this.apply();
				},
				getOffset: function(){
					var res = angular.extend({x: 0, y: 0}, this.panOffset) ;
					res.x *= this.zoomFactor;
					res.y *= this.zoomFactor;
					if(this._own){
						res.x = (res.x + this._own.panOffset.x) * this._own.zoomFactor;
						res.y = (res.y + this._own.panOffset.y) * this._own.zoomFactor;
					}
					return res;
				},
				applyZoomMultiplyer: function(mul, point){
					this.zoomFactor *= mul;
					var dx = point.x * (1 - mul),
						dy = point.y * (1 - mul),
						zp = this.zoomFactor,
						movex = point.deltaX,
						movey = point.deltaY
					;
					if(this._own){
						var zo = this._own.zoomFactor,
							xo = this._own.panOffset.x,
							yo = this._own.panOffset.y,
							zk = zo * zp
						;

						this.panOffset.x += xo * (mul - 1) / zp + dx / zk;
						this.panOffset.y += yo * (mul - 1) / zp + dy / zk;

					} else {
						var rz = this.zoomFactor;
						this.panOffset.x += dx / zp;
						this.panOffset.y += dy / zp;
					}
					if(movex || movey) this.setOffsetDelta({x: movex, y: movey});

					this.apply();
				},
				apply: function(){
					this.triggerEvent("changeView", this);
					this._children.forEach( child => child.apply());
				},

				getParamsByLocal: function(x, y, z){
					var zoom = this.getZoom(), offset = this.getOffset();
					return {
						x: x + offset.x,
						y: y + offset.y,
						zoom: zoom * z
					};
				}

			});
			return res;
		}
	}
})();
