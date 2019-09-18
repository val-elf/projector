(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('fileUploader', FileUploader)
	;

	function FileUploader(PreviewImageService, $base64, $q, modal, $http){
		return {
			restrict: 'E',
			replace: true,
			require: ['?ngModel', 'fileUploader'],
			templateUrl: 'common/directives/ui/file-uploader.html',
			scope: {
				mode: '@',
				accept: '@',
				uploadTo: '@',
				multiple: '=?',
				closeOnUpload: '=',
				uploaderInstanceSetter: '=',
				/* ---- file uploader events */
				onPreLoad: '&',
				onPostLoad: '&',
				onProgress: '&',
				onFinish: '&'
			},
			transclude: true,
			controller: FileUploaderController,
			controllerAs: 'ctrl',
			link: function($scope, elem, attrs, ctrls){
				$scope.ngModelCtrl = ctrls[0];
				var vm = ctrls[1];

				$scope.multiple = $scope.multiple !== undefined ? $scope.multiple : false;
				$scope.mode = $scope.mode !== undefined ? $scope.mode : 'button';

				if($scope.accept) vm.inp.accept = $scope.accept;

				$scope.uploaderInstanceSetter && $scope.uploaderInstanceSetter(vm);
				
				angular.extend($scope, {
					selectFiles: function(){
						if($scope.mode === 'window'){
							this.files = [];
							this.file = null;
							this.openUploadWindow();
						}
						else if($scope.mode === 'button') this.selectFilesImp();
					},
					openUploadWindow: function(){
						modal.open({
							templateUrl: 'common/directives/ui/file-uploader-window.html',
							scope: this
						});
					},
					removeFile: function(file){
						var ind = this.files.indexOf(file);
						if(ind > -1) this.files.splice(ind, 1);
					},
					selectFilesImp: function(){
						var inp = vm.inp;

						inp.multiple = $scope.multiple;
						inp.value = null;
						inp.click();
					},

					startUpload: function(){
						var ups = [];
						this.files.forEach(function(file){
							var xhr = new XMLHttpRequest(),
								fd = new FormData(),
								dfr = $q.defer()
							;

							ups.push(dfr.promise);
							$scope.$url = $scope.uploadTo;
							$q.when($scope.onPreLoad({$url: $scope.uploadTo, $file: file}), function(url){
								url = url || $scope.uploadTo;

								fd.append("fileToUpload", file);

								xhr.upload.addEventListener("progress", function(evt){
									file.progress = Math.round(evt.loaded / evt.total  * 100);
									$scope.onProgress({$file: file, $progress: file.progress});
									$scope.$evalAsync();
								});

								xhr.addEventListener("load", function(evt){
									var obj = evt.target.response;
									if(obj) obj = JSON.parse(obj);
									file.uploaded = true;
									$scope.onPostLoad({$file: file, $result: obj});
									$scope.$evalAsync();
									dfr.resolve();
								});

								xhr.open("POST", url);
								xhr.send(fd);
							});
						}, this);

						$q.all(ups).then(function(){
							if($scope.closeOnUpload) modal.close();
							$scope.onFinish({});
						})
					}
				});

				vm.inp.addEventListener("change", function(){
					$scope.files = Array.prototype.slice.call(vm.inp.files);
					$scope.file = vm.inp.files.length == 1 && vm.inp.files[0] || null;
					vm.containsFileToUpload = !!$scope.files.length;

					var fstack = [].concat($scope.files), done = $q.defer(),
						img = document.createElement("img");

					function prepPreview(promise, file){
						var data = {};
						file.data = data;
						file.source = this.result;
						data.preview = $base64.encode(this.result);
						//var img = document.createElement("img");
						img.src='data:'+file.type+';base64,' + data.preview;
						data.type = file.type;
						img.onload = function(){
							data.height = img.height;
							data.width = img.width;
							promise.resolve(this.result);
						}
					}

					function prepIcon(file, fileInfo){
						file.fileInfo = fileInfo;
					}

					function loadFiles(){
						if(!fstack.length){
							done.resolve();
							return;
						}
						var file = fstack.shift(), pr;
						file.progress = 0;

						if(file.type.match(/^image\//)){
							var fr = new FileReader(), pr = $q.defer();
							fr.readAsBinaryString(file);
							fr.addEventListener('loadend', prepPreview.bind(fr, pr, file));
						} else {
							//check to known file types
							var fn = file.name.match(/\.([^\.]*)$/),
								tp = file.type.match(/(.+)\/(.+)/),
								ext = fn && fn[1] || null,
								kind = tp && tp[1] || null, type = tp && tp[2] || null;

							file.fileInfo = {
								ext: ext,
								kind: kind,
								type: type
							};
						}
						$q.when(pr && pr.promise || true).then(loadFiles);
					}
					loadFiles();

					app.showLoader(true, elem);
					$q.when(done.promise).then(function(res){
						$scope.$evalAsync(function(){
							if($scope.ngModelCtrl){
								$scope.ngModelCtrl.$setViewValue($scope.file || $scope.files);
							}
							app.showLoader(false, elem);
						});
					});
				});				

			}
		}
	}

	function FileUploaderController($scope){
		
		var inp = document.createElement("input");
		inp.type = 'file';
		inp.accept = 'image/*';

		this.inp = inp;

		angular.extend(this, {
			containsFileToUpload: false,
			upload: function(){
				$scope.startUpload();
			}
		})

	}
})();
