function PenTool(editor, $q){
	var workingShape;

	angular.extend(this, {
		name: 'pen',
		processPoint: function(point){

			if(!workingShape){
				workingShape = editor.workingMap.createNewShape();
				workingShape.on("closePath", event => {
					return editor.processClosePath(event);
				});

				workingShape.on('controlClick', editor.selectControlPoint);
			}
			workingShape.addEndPoint(point);
			return workingShape;
		},

		cancel: function(){
			workingShape && workingShape.remove();
			workingShape = null;
		},

		finishShape: function(){
			editor.stopDrawing();
		},

		destroy: function(){
			if(workingShape) workingShape.remove();
		},

		inProgress: function(){
			return !!workingShape;
		},

		stopDrawing: function(){
			var res = workingShape;
			if(workingShape){
				workingShape.close();
				workingShape = null;
			}
			return res;
		}
	});
}