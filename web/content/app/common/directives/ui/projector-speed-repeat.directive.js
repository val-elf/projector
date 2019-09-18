(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjSpeedRepeat', ProjectorSpeedRepeatDirective)
	;

	/*function getItemByName(obj, path){
		var pts = path.split('.');

		function getItemByParts(obj, parts){
			var part = parts.shift();
			if(part && obj[part] !== undefined){
				if(typeof(obj[part]) === "object" && parts.length) return getItemByParts(obj[part], parts);
				else if(parts.length) return null;
				else return obj[part];
			}
			return null;
		}

		return getItemByParts(obj, pts);
	}*/

	function ProjectorSpeedRepeatDirective($compile){
		return {
			restrict: 'A',
			replace: true,
			compile: function(elem, attr){
				var tmpl = elem.clone();
				tmpl[0].removeAttribute('pj-speed-repeat');
				tmpl = tmpl[0].outerHTML;

				return function(scope, elem, attr){
					var rule = attr.pjSpeedRepeat,
						mt = rule.match(/^(.+)\s+in\s+(.+)$/),
						itemName = mt[1],
						sourcePath = mt[2],
						sts = scope.$parent,
						nodeParent = elem.parent()
					;

					elem.remove();

					scope.$watch(sourcePath, function(src){
						nodeParent.empty();
						angular.forEach(src, function(item, index){
							var sc = scope.$new();
							sc[itemName] = item;
							sc['$index'] = index;
							var nd = $compile(tmpl)(sc);
							nodeParent.append(nd);
						});

					})

				}

			}
		}
	}
})();
