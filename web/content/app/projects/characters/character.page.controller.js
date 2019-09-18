(function(){
	'use strict';

	angular.module('projector.projects')
		.controller('CharacterPageController', CharacterPageController)
		.controller('CharacterGalleryController', CharacterGalleryController)
	;

	function CharacterPageController($scope, $sce, modal, CharactersService, CharacterTypes, $stateParams, character, alert, loader){
        var vm = this;

		$scope.character = character;
		$scope.chartypes = CharacterTypes;

		angular.extend($scope, {
			galleryController: {},
			toggleLocked: function(){
				this.character.locked = !this.character.locked;
				this.character.save().then(function(){
					alert({
						isMessage: true,
						message: "успешно сохранено"
					});
				})
			},
			editCharacter: function() {
				modal.open({
					templateUrl: 'projects/characters/character.card.html',
					controller: 'CharacterCardController as characterCtrl',
					params: {
						character: $scope.character
					}
				});
			}
		});

	}

	function CharacterGalleryController($scope, modal, CathegoriesService, AbstractOwnerService){
		var catServ = CathegoriesService($scope.character),
			vm = this,
			pind;
		vm.gallery = [];

		angular.extend(vm, {
			selectAll: false,
			selected: {}
		})


		function getGallery(count){
			var gallery = [];
			for(var i = 0; i < count; i++){
				var ind  = (Math.round(Math.random() * 9) + 1), st = Math.round(Math.random() * 1000);
				if(ind === pind) ind = (ind + 1) % 10 + 1;
				pind = ind;
				gallery.push({
					preview: {
						previewUrl: 'img/testImages/'+ ind +'.jpg'
					},
					_id: i + st,
					selected: false
				});
			}
			return gallery;
		}

		catServ.getCathegories().then(function(catList){
			vm.cathegories = catList;
			vm.selectedCathegory = catList[0];
			//vm.selectedCathegory = findCathegory(catList, "56850400a82dd48032890542");
		});

		catServ.onRefresh = function(catList){
			vm.cathegories = catList;
		}

		function findCathegory(cats, catId){
			var res = cats.find(function(cat){
				return cat._id === catId;
			});
			if(!res){
				cats.some(function( cath ){
					if(cath.children && cath.children.length) res = findCathegory(cath.children, catId);
					return res;
				});
			}
			return res;
		}

		angular.extend(vm, {
			checkSelection: function(){
				vm.gallery.forEach(function(item){
					this.selectGalleryItem(item, vm.selectAll);
				}, this);
			},
			getSelectedCount: function(){
				return Object.keys(vm.selected).length;
			},
			selectGalleryItem: function(item, force){
				var select;
				if(force == undefined)
					select = !vm.selected[item._id];
				else
					select = force;

				if(select)
					vm.selected[item._id] = item;
				else {
					delete vm.selected[item._id];
				}
				if(!select) vm.selectAll = false;
				if(Object.keys(vm.selected).length && Object.keys(vm.selected).length === vm.gallery.length)
					vm.selectAll = true;
			},
			getCollectionLength: function(){
				return vm.gallery.length;
			}
		})

		angular.extend($scope, {
			galleryType: 'bricks',
			addNewCathegory: function(parent, event){
				event && event.stopPropagation();
				var cathegory = catServ.createCathegory(parent);

				modal.open({
					templateUrl: 'projects/modals/catergory.create.card.html',
					controller: 'CathegoryCardController',
					params: {
						cathegory: cathegory,
						parent: parent,
						onSave: function(cathegory){
							catServ.refresh().then(function(){
								vm.selectedCathegory = findCathegory(vm.cathegories, cathegory._id);
							});
						}
					}
				})
			},
			selectCathegory: function(){
				var item = vm.selectedCathegory;
				var ownerService = item && AbstractOwnerService(item) || null;
				if(item && !item.gallery){
					ownerService.getFiles().then(function(files){
						item.gallery = files;
						vm.gallery = files;
					})
					//item.gallery = getGallery(Math.round(Math.random() * 10) + 5);
				}
				else
					vm.gallery = item && item.gallery || null;
				vm.selected = {};
				vm.selectAll = false;
			},
			isSelectedCathegory: function(item){
				return item === vm.selectedCathegory;
			}


		});
	}

})();
