(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('textEditor', TextEditorDirective)
		.directive('textEditorPanel', TextEditorPanelDirective)
		.controller('TextEditorController', TextEditorController)
	;

	function TextEditorDirective(FontNames, FontSizes, TextStyles, $sce, base64){

		tinymce.init({
			inline: true,
			skin: false,
			statusbar: false,
			toolbar: false,
			menubar: false,
			formats: angular.extend({}, FontNames, FontSizes)
		});

		return {
			restrict: 'E',
			require: ['?ngModel', 'textEditor'],
			scope: {
				rows: '=?',
				maxHeight: '=?',
				minHeight: '=?',
				height: '@',
				smallButtons: '=?',
				options: '=?',
				isBase64: '=?'
			},
			replace: true,
			templateUrl: 'common/directives/text-editor/text-editor.html',
			transclude: true,
			controller: TextEditorController,
			controllerAs: 'textEditorCtrl',
			link: function(scope, elem, attr, ctrls){
				var 
					elm = $(elem[0]),
					teNode = $(elm).find(".text-editor"),
					id = Math.random().toString().replace('0.', ''),
					editor, lastRange, deferredInit = false,
					ngModelCtrl = ctrls[0],
					txtEditor = ctrls[1],
					toolPanel = elm.find(".tool-panel .custom-panel");

				if(!scope.maxHeight && scope.rows) scope.maxHeight = (scope.rows * 2) + 'em';

				if(txtEditor.panelElement){
					toolPanel.append(txtEditor.panelElement);
				}

				scope.ngModelCtrl = ngModelCtrl;
				teNode.attr("id", id);

				txtEditor.container = elm;

				if(scope.options){
					scope.options.editorInstance = txtEditor;
				}
				txtEditor.model = ngModelCtrl;
				txtEditor.container = elem[0];

				function defineContent(isFirst){
					if(!editor){
						deferredInit = true;
						return;
					}
					deferredInit = false;
					editor.setContent(scope.isBase64 && ngModelCtrl.$modelValue ? base64.decode(ngModelCtrl.$modelValue) : ngModelCtrl.$modelValue || '');
					scope.options && scope.options.onInit && scope.options.onInit(txtEditor);
				}

				if(ngModelCtrl)
					ngModelCtrl.$render = () => defineContent();

				function getActualFormat(fmts){
					var max = null;
					Object.keys(fmts).forEach(function(fmt){
						if(!max || fmts[fmt] > fmts[max]) max = fmt;
					});
					return max;
				}

				teNode.on('blur', function(){
					lastRange = window.getSelection().getRangeAt(0);
				});

				angular.extend(scope, {
					fontNames: FontNames,
					fontSizes: FontSizes,
					textStyles: TextStyles,
					styles: {},
					tstyles: {},
					fonts: {},
					sizes: {},
					do: function(what, isApply){
						if(editor && editor.formatter.canApply(what)) {
							teNode[0].focus();
							if(lastRange){
								window.getSelection().removeAllRanges();
								window.getSelection().addRange(lastRange);
							}
							editor.formatter[isApply ? 'apply':'toggle'](what);
						}
					},
					doCommand: function(what){
						if(editor){
							editor.execCommand(what);
						}
					},
					fontChange: function(){
						var apply = true, fname = this.fontName;
						if(fname === null){
							apply = false;
							fname = getActualFormat(this.fonts);
						}
						this.do(fname, apply);
					},
					sizeChange: function(){
						var apply = true, size = this.fontSize;
						if(size === null){
							apply = false;
							size = getActualFormat(this.sizes);
						}
						this.do(size, apply);
					},
					styleChange: function(){
						this.do(this.textStyle, true);
					},
					getStyle: function(styleName){
						var fm = TextStyles[styleName], fmt = $sce.trustAsHtml("<" + fm.format + ">" + fm.title + "</" + fm.format + ">");
						return fmt;
					},
					formatChanged: function(isOn, format){
						var fn = format.format;
						this.styles[fn] = isOn;	

						function isFormat(fn){
							return Object.keys(TextStyles).some(function(ts){
								return TextStyles[ts].format === fn;
							});
						}

						if(fn.match(/Font$/)) {
							if(isOn) this.fonts[fn] = format.parents.length;
							else delete this.fonts[fn];
							this.fontName = getActualFormat(this.fonts);
						}
						if(fn.match(/px$/)) {
							if(isOn) this.sizes[fn] = format.parents.length;
							else delete this.sizes[fn];
							this.fontSize = getActualFormat(this.sizes);
						}
						if(isFormat(fn)) {
							if(isOn) this.tstyles[fn] = format.parents.length;
							else delete this.tstyles[fn];
							this.textStyle = getActualFormat(this.tstyles);
						}
						this.$evalAsync();
					}
				})

				if(tinymce){

					setTimeout(()=>{
						tinymce.execCommand('mceAddEditor', false, id);
						editor = tinymce.get(id);
						if(!editor) return;
						txtEditor.editor = editor;
						var tstyles = Object.keys(TextStyles).map(function(ts){return TextStyles[ts].format});
						var fontsChangeds = Object.keys(angular.extend({}, FontNames, FontSizes)).concat(tstyles).join(',');
						editor.formatter.formatChanged("bold,italic,underline,alignleft,alignright,aligncenter,alignjustify," + fontsChangeds, scope.formatChanged.bind(scope), false);
						editor
							.on('change', function(){
								var ec = scope.isBase64 ? base64.encode(editor.getContent()) : editor.getContent();
								if(ngModelCtrl && ngModelCtrl.$modelValue !== ec){
									ngModelCtrl.$setViewValue(ec);
								}
							})
						if(deferredInit) defineContent();
					});
				} else {
					elem.append("<textarea></textarea>");
				}


			}
		}
	}

	function TextEditorPanelDirective(){
		return {
			restrict: 'E',
			require: '^textEditor',
			link: function(scope, elem, attr, textEditorController){
				textEditorController.registryPanel(elem);
			}
		}
	}

	function TextEditorController($scope, $compile){
		angular.extend(this, {
			editor: null,
			registryPanel: function(panelElement){
				this.panelElement = $compile(panelElement.html())($scope);
			},
			setToFullScreen: function(){
				this.container.webkitRequestFullScreen();
			},
			markSelection: function(className){
				if(!this.editor) return;
				var rng = this.editor.selection.getRng();
				var el = rng.startContainer,
					pos = rng.startOffset;
				while(el.nodeType !== 1) el = el.parentNode;
				$(this.editor.targetElm).find(".caret").removeClass("caret");						
				$(el).addClass("caret");
				if(this.model) this.model.$setViewValue(this.editor.getContent());
				return pos;
			},
			moveToMark: function(className, offset){
				if(!this.editor) return;
				setTimeout(()=>{
					var caret = $(this.editor.targetElm).find(".caret");
					if(caret && caret.length){
						var rng = this.editor.selection.getRng();
						rng.setStart(caret[0].childNodes[0], offset);
						rng.collapse(true);
						this.editor.selection.setRng(rng);
						caret[0].scrollIntoView();
					}
					this.editor.focus();
				});
			}
		});
	}
})();
