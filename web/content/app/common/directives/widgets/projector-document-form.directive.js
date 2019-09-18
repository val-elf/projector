(function(){
	'use strict';
	angular.module('projector.directives')
		.directive('pjDocumentForm', ProjectorDocumentFormDirective)
		.controller("ProjectorDocumentFormController", ProjectorDocumentFormController);

	function ProjectorDocumentFormDirective(){
		return {
			restrict: 'E',
			templateUrl: 'common/directives/widgets/projector-document-form.html',
			controller: "ProjectorDocumentFormController",
			controllerAs: "docCtrl",
			require: 'pjDocumentForm',
			link: function(scope, elem, attr, own){
				own.element = $(elem[0]);
				scope._document = scope.document.plain && scope.document.plain() || angular.copy(scope.document);
				setTimeout(function(){
					own.miniPreview = own.element.find(".mini-preview");
					own.miniPreview.on('transitionend', own.setHidden);
				});

				scope.save = function(close){
					angular.extend(
						scope.document, scope._document
					);

					scope.document.save().then(function(){
						close && scope.$close();
					}, function(){
						close && scope.$close();
					});
				}
			}
		}
	}

	function ProjectorDocumentFormController($scope, DocumentsService){
		var vm = this,
			mediatype = $scope.document.metadata.mediatype,
			mime = $scope.document._file && $scope.document._file.exif && $scope.document._file.exif.mimeType || $scope.document.metadata.type || '' ;

		if(mime === 'image/gif'){
			mediatype = 'video';
		}
		if(mediatype === 'image'){
			var img = $("<img>").attr("src", "/srv/file/" + $scope.document._file._id)
			img[0].addEventListener("load", function(){
				vm.width = img[0].width;
				vm.height = img[0].height;
				if(vm.width < 600 && vm.height < 600){
					vm.nonMovable = true;
					vm.type = 'auto';
				}
			});
		}

		$scope.mediatype = mediatype;
		$scope.mime = mime;

		if(mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'){			
			DocumentsService.getDocumentFilePreview($scope.document).then(function(data){
				$scope.fileData = data;
			});
		}



		angular.extend(this, {
			type: 'contain',
			lpos: '50%',
			tpos: '50%',
			minlpos: 10,
			mintpos: 10,
			outWidth: 50,
			nonMovable: false,
			editorOptions: {},

			mouseMove: function(evt){
				if(this.nonMovable || this.type === 'contain') return;
				if(this.width < 600){
					this.lpos = '50%';
					this.minlpos = 10;
					this.outWidth = this.twidth;
				}
				else {
					var proc = evt.offsetX / 600;
					this.lpos = (proc * 100) + '%';
					this.outWidth = 600 / this.width * this.twidth;
					this.minlpos = 10 + (this.twidth - this.outWidth) * proc;
				}
				if(this.height < 600){
					this.tpos = '50%';
					this.mintpos = 10;
					this.outHeight = this.theight;
				}
				else{
					var proc = evt.offsetY / 600;
					this.outHeight = 600 / this.height * this.theight;
					this.tpos = (proc * 100) + '%';
					this.mintpos = 10 + (this.theight - this.outHeight) * proc;
				}

			},
			setHidden: function(){
				vm.type === 'contain' && vm.miniPreview.addClass("hidden");
			},

			saveDocument: function(close){
				$scope.save(close);
			},

			togglePreviewMode: function(){
				if(this.nonMovable) return;								
				this.type = this.type === 'contain' ? 'auto' : 'contain';
				if(this.type === 'auto') this.miniPreview.removeClass("hidden");

				if(this.type === 'contain'){
					this.lpos = '50%';
					this.tpos = '50%';
				} else {
					this.twidth = 120;
					this.theight = 120 * this.height / this.width;
				}
			}
		});
	}
})();
