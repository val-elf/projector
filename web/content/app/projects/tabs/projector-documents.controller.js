(function(){
	angular.module('projector.projects')
		/*.config(function(stateProvider){
			$stateProvider
				.state('app.projects-item.docs', {
					url: '/'
				})*/
		.controller('ProjectDocumentsController', ProjectDocumentsController)
	;

	function ProjectDocumentsController($scope, $q, $compile, AbstractOwnerService, CathegoriesService, DocumentsService, modal, alert){
		var vm = this;
		vm.ownerService = AbstractOwnerService($scope.project);
		vm.docService = DocumentsService($scope.project);
		vm.project = $scope.project;
		vm.documents = [];
		var catServ = CathegoriesService($scope.project),
			openedPage = 1,
			pageCount = 80,
			needMore = true;



		function refreshDocuments(){
			if(!needMore) return;
			vm.loaded = false;
			app.showLoader(true, "#endDocuments");
			vm.docService.getList({page: openedPage, count: 80}).then(function(docs){
				vm.documents = vm.documents.concat(docs);
				vm.meta = docs._;
				needMore = docs._.more;
				vm.loaded = true;
				app.showLoader(false);
			});
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

		catServ.getCathegories().then(function(list){
			vm.cathegories = [
				{
					_id: vm.project._id,
					name: vm.project.name,
					children: list
				}
			];
			vm.selectedCathegory = vm.cathegories[0];
		});

		angular.extend(this, {
			selectedDocuments: {},
			selectAll: false,

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
                                console.log("CATH", vm.cathegories);
								vm.selectedCathegory = findCathegory(vm.cathegories, cathegory._id);
							});
						}
					}
				})
			},

			openFileInfo: function(doc, event){
				event && event.stopPropagation();
				modal.open({
					templateUrl: 'projects/modals/document-info-page.html',
					params: {
						document: doc
					}
				})
			},

			prepareOwner: function(url, file){
				//we should be created new document Item there
				var doc = vm.docService.createDocument(file);
				return doc.save().then(function(doc){
					return url+"?owner=" + doc._id;
				});
			},

			isSelectedCathegory: function(cat){

			},

			checkSelection: function(){
				vm.documents.forEach(function(item){
					this.selectGalleryItem(item, vm.selectAll);
				}, this);
			},
			getSelectedCount: function(){
				return Object.keys(vm.selectedDocuments).length;
			},
			getCollectionLength: function(){
				return vm.documents && vm.documents.length || 0;
			},
			getTotalCount: function(){
				return vm.meta.total;
			},
			loadMoreDocuments: function(side){
				switch(side){
					case 'bottom':
						openedPage ++;
						refreshDocuments();
					break;
				}
			},
			selectGalleryItem: function(item, force){
				var select;
				if(force == undefined)
					select = !vm.selectedDocuments[item._id];
				else
					select = force;

				if(select)
					vm.selectedDocuments[item._id] = item;
				else {
					delete vm.selectedDocuments[item._id];
				}
				if(!select) vm.selectAll = false;
				if(Object.keys(vm.selectedDocuments).length && Object.keys(vm.selectedDocuments).length === vm.documents.length)
					vm.selectAll = true;
			},
			createTextDocument: function(){
				var doc = vm.docService.createDocument();
				modal.open({
					templateUrl: 'projects/modals/document.create.card.html',
					params: {
						document: doc
					}
				}).then(()=> this.reloadDocuments());
			},
			reloadDocuments: function(){
				vm.selectedDocuments = {};
				vm.selectAll = false;
				vm.documents = [];
				openedPage = 1;
				needMore = true
				refreshDocuments();
			},
			selectCathegory: function(){
				vm.docService = DocumentsService(vm.selectedCathegory || vm.project);
				this.reloadDocuments();
			},
			deleteSelecteds: function(){
				alert({
					template: '<p>Вы уверены что хотите удалить эти документы?</p>' +
						'<div pj-scrollable min-height="300" max-height="600">' +
						'<ol><li ng-repeat="doc in ctrl.selectedDocuments" ng-bind="doc.title"></li></ol>' +
						'</div>',
					isConfirm: true,
					scope: $scope
				}).then(function(res){
					if(res) {
						var rems = [];
						angular.forEach(vm.selectedDocuments, function(item, key){
							rems.push(item.remove());
						});
						$q.all(rems).then(function(){
							vm.reloadDocuments();
						})
					}
				})
			}
		})
	}

})();
