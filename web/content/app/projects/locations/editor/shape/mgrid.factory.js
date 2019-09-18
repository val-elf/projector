(function(){
	'use strict';
	angular.module('projector.services')
		.service("MercatorGrid", ProjectorMercatorGridService)
	;

	function ProjectorMercatorGridService(){
		return function(map){
			var line = map.paper.path().attr({fill:"violet", stroke: "#000000", "stroke-width": 1, "stroke-opacity": 0.3});
			var zero = map.paper.path().attr({fill: "violet", stroke: "#000000", "stroke-width": 1.5, "stroke-opacity": 0.5});
			var DEGREE_AMNT = 1000,
				getRad = grd => grd * Math.PI / 180;

			function generateGrid(zoom, offset){
				var str = "", zf = DEGREE_AMNT * zoom,
					rad = zf * 5.729578,
					x = offset.x,
					y = offset.y,
					l = offset.x,
					t = offset.y
				;
				for(var i = 0; i < 37; i ++){ //vertical
					var gf = x + rad * getRad(i * 10);
					str += "M" + gf + "," + t + "L" + gf + "," + (t + 28 * zf);
				}
				var oz = 14 * zf + t;
				y = 0;
				for(var i = 0; i < 8; i ++){//horizontal
					var teta = getRad( (i + 1) * 10);
					var gf = rad * Math.log(Math.tan(Math.PI/4 + teta / 2));
					str += "M"+ l +"," + (oz - gf) + "L"+ (l + 36 * zf) + "," + (oz - gf) + 
						"M"+ l +"," + (oz + gf) + "L"+ (l + 36 * zf) + "," + (oz + gf);
				}
				return str;
			}

			function generateEquator(zoom, offset){
				var zf = DEGREE_AMNT * zoom,
					l = offset.x,
					t = offset.y,
					x = offset.x + 18 * zf,
					y = offset.y + 14 * zf;
				return "M" + l + "," + y + "L" + (l  + 36 * zf) + "," + y + 
					"M" + x + "," + t + "L" + x + ","+ (t + 28 * zf);
			}

			var apply = (vp) => {
				var zoom = vp.getZoom(), offs = vp.getOffset();
				line.attr({"path": generateGrid(zoom, offs)});
				zero.attr({"path": generateEquator(zoom, offs)});
				line.toFront();
				zero.toFront();
			};


			map.viewport.on("changeView", apply);
			apply(map.viewport);
		};
	}

})();
