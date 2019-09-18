function PaneTool(editor, $q){
	angular.extend(this, {
		name: 'pane',
		startPos: null,
		processPoint: function() { },
		destroy: function(){},
		startDrag: function(x, y, event, viewport){
			viewport = viewport || editor.viewport;
			this.state = null;
			this.startPos = angular.extend({}, viewport.getOffset());
		},
		canMakeAction: function(action){
			return action !== "drag";
		},
		spacePressing: function(){ },
		drag: function(x, y, event, viewport){
			if(!this.startPos){
				this.startPos = angular.extend({}, viewport.getOffset());
			}
			viewport = viewport || editor.viewport;
			this.state = 'drag';
			viewport.setOffset({
				x: this.startPos.x + x,
				y: this.startPos.y + y
			});
		},
		stopDrag: function(){
			this.startPos = null;
			setTimeout(() => {
				this.state = null;
			})
		}
	});
}