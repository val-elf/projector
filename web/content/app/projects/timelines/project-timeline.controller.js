(function(){
	'use strict';

	angular.module('projector.projects')
		.controller('ProjectTimelineController', ProjectTimelineController)
		.controller('ProjectTimelineAssignCharactersController', ProjectTimelineAssignCharactersController)
	;

	function ProjectTimelineController($scope, $q, $interval, $state, $stateParams,
		TimelinesService,
		TimespotsService,
		CharactersService,
		CharacterTypes,
		DocumentsService,
		alert,
		modal,
		project,
		timeline
	) {
		var vm = this;
		if($scope.dashboardMode){
			$scope.setDashboardMode(false);
			return;
		}

		function RefreshTimeline(){
			return;
			/*tls.get($stateParams.timelineId).then(function(timeline){
				vm.timeline = timeline;
			});*/
		}

		function prepareCharactersIds(spot){
			return (spot.characters || []).reduce(function(res, item){
				if(res._id[0] === 'undefined') res._id = [];
				res._id.push(item._character);
				return res;
			}, {_id: ['undefined']});
		}

		var charsServ = CharactersService(project), charsCount;
		charsServ.getCharactersCount().then(function(data){
			charsCount = data.count;
		});

		angular.extend(this, {
			timeline: timeline,
			charTypes: CharacterTypes,
			spotAutoSave: true,
			editorOptions: {
				editorInstance: null,
				onInit: editor => {
					if(this.currentSpot){						
						editor.moveToMark('caret', this.currentDocument.cursorPosition);
					}
				}
			},
			charEditorOptions: {
				onInit: function(editor){
					editor.moveToMark('caret', this.currentDocument.cursorPosition);
				}				
			},

			selectSpot: function(spot){							
				if(this.currentSpot != spot) {
					vm.currentSpot = spot;
					var dserv = DocumentsService(spot);
					if(spot._document){
						dserv.getDocument(spot._document).then(doc => vm.currentDocument = doc);
					} else {
						var spotDocument = dserv.createDocument({title: '', metadata: {type: 'base64/html'}});
						spotDocument.save().then(doc => {
							vm.currentDocument = doc
							spot._document = doc._id;
							spot.save();
						});
					}
					vm.selectedItem = null;
					if(vm.currentSpot.characters) {
						vm.applyTimespotCharacters();
					}
				}
				else
					this.currentSpot = null;

				return this.currentSpot === spot;
			},

			applyTimespotCharacters: function(){
				var _wr = {}, mp = {};

				_wr = vm.currentSpot.characters.reduce(function(res, item){
					res[item._character] = {
						data: item
					};
					return res;
				}, {});
				charsServ.getList(prepareCharactersIds(vm.currentSpot)).then(function(characters){						
					characters.forEach(function(char){
						mp[char._id] = angular.extend({
							source: char
						}, _wr[char._id]);
					});
					vm.characters = mp;
				});
			},

			assignCharacters: function(){
				modal.open({
					templateUrl: 'projects/timelines/add-characters.modal.html',
					controller: 'ProjectTimelineAssignCharactersController as ctrl',
					params: {
						project: project,
						timeline: timeline,
						timespot: vm.currentSpot
					}
				}).then(function(){
					vm.applyTimespotCharacters();
				});
			},

			saveCharDescription: function(charInfo){
				var src = this.selectedChar.source;
				this.charEditorOptions.editorInstance.markSelection('caret');
				//delexitete this.selectedChar.source;
				$q.when(this._saveTimeSpotState(), function(){
					//vm.selectedChar.source = src;
				});

			},

			hasCharacters: function(){
				return charsCount > 0
			},

			_saveTimeSpotState: function(pos){
				return this.currentSpot.save().then(function(ts){
					angular.extend(vm.currentSpot, ts.plain());
				});
			},

			changeTimeLineName: function(){
				timeline.save().then(function(){
					alert({
						isMessage: true,
						message: "saved successfully"
					})
				});
			},

			changeTimeSpotName: function(){
				this._saveTimeSpotState();
			},

			timespotChange: function(spot){
				if(spot._id){
					spot.save();
				}
			},

			toggleSpotLocked: function(){
				if(this.currentSpot){
					this.currentSpot.locked = !this.currentSpot.locked;
					this._saveTimeSpotState();
				}
			},

			saveSpotState: function(){
				if(this.currentSpot){
					this._saveTimeSpotState(pos);
				}
			},

			saveSpotDocument: function(){
				if(vm.currentDocument) {
					var editor = this.editorOptions.editorInstance, pos;
					if(editor) vm.currentDocument.cursorPosition = editor.markSelection('caret');
					vm.currentDocument.save().then(function(){
					});
				}
			},

			editTimeline: function(){
				modal.open({
					templateUrl: 'projects/timelines/timeline.card.html',
					params: {
						project: project,
						timeline: timeline
					},
					controller: 'TimelineCardController'
				})
			},

			deleteTimeline: function(){
				if(timeline.locked) return;
				
				alert({
					message: "Вы действительно хотите удалить таймлайн?",
					okButton: "Да",
					isConfirm: true
				}).then(function(value){
					if(value) {
						timeline.remove().then(function(){
							alert({
								message: 'Удаление прошло успешно',
								isMessage: true
							})
							$state.go("app.projects-item.tab", {tabname: 'timelines'});
						}, function(err){
							alert({
								message: "Ошибка при удалении:",
								isMessage: true,
								error: err
							})
						});
					}
				});
			},

			lockTimeline: function(){
				timeline.locked = !timeline.locked;
				timeline.save().then(function(){
					alert({
						isMessage: true,
						message: "successfully updated"
					})
				});
			},

			deleteFreshSpot: function(){
				timeline.timespots.some(function(spot, index){
					if(spot == vm.currentSpot){
						timeline.timespots.splice(index, 1);
						return true;
					};
				});
				delete this.currentSpot;
			},

			deleteSpot: function(){
				if(this.currentSpot.locked) return;
				alert({
					message: 'Вы уверены что хотите удалить таймспот?',
					okButton: 'Да',
					isConfirm: true
				}).then(function(value){
					if(value){
						vm.currentSpot.remove().then(function(){
							vm.currentSpot = null;
							alert({
								message: 'Удалено успешно',
								isMessage: true
							})
							RefreshTimeline();
						}, function(error){
							alert({
								message: 'Ошибка при удалении:',
								error: error
							})
						});
					}
				});
			},

			selectChar: function(char){
				if(this.selectedChar != char){
					this.selectedChar = char;
					this.selectedItem = char;					
				} else {
					this.selectedChar = null;
					this.selectedItem = null;
				}
			},

			editSpot: function(){
				modal.open({
					templateUrl: 'projects/timelines/timespot.card.html',
					params: {
						spot: vm.currentSpot,
						timeline: timeline
					},
					controller: "TimespotCardController"
				})
			},

			checkSpotToAutoUpdate: function(){
				if(this.spotAutoSave){
					return this.saveSpotDocument();
				}
				return true;
			},

			fullscreenModeToggle: function(){
				var elm = this.editorOptions.editorInstance.container;
				elm.webkitRequestFullScreen();
			}
		});
	}

	function ProjectTimelineAssignCharactersController($scope, CharactersService){
		var projectCharacters,
			vm = this,
			project = $scope.project,
			timeline = $scope.timeline,
			timespot = $scope.timespot,
			charServ = CharactersService(project)
		;

		vm.selected = {};
		timespot.characters && timespot.characters.forEach(function(item){
			if(item && item._character) vm.selected[item._character] = true;
		})

		charServ.getList().then(function(charList){
			vm.characters = charList;
		});

		$scope.save = function(){
			timespot.characters = [];
			angular.forEach(vm.selected, function(itm, index){
				itm && timespot.characters.push({_character: index});
			});
			timespot.save();
			$scope.$close();
		}
	}
})();