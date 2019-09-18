'use strict';

module.exports = function (grunt) {
	// load all grunt tasks
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	//grunt.loadNpmTasks('grunt-bower');
	grunt.loadNpmTasks('grunt-injector');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-notify');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-browser-sync');


	grunt.initConfig({
		notify_hooks: {
			options: {
				enabled: true,
			}
		},
		notify: {
			less: {
				options: {
					title: "CSS compile complete",
					message: "Less are compiled"
				}
			}
		},
		ngtemplates: {
			prod: {
				cwd: '../content/app',
				src: '**/*.html',
				dest: '../content/templates.js',
				options: {
					module: 'projector'
				}
			}
		},
		browserSync: {
			bsFiles: {
				src: [
					'../content/app/**/*.js',
					'../content/*.css',
					'../content/app/**/*.html',
					'../content/index.html'
				]
			},
			options: {
				proxy: 'localhost:7003'
			}
		},
		watch: {
			less: {
				// if any .less file changes in directory "public/css/" run the "less"-task.
				files: "../content/less/*.less",
				tasks: ["less", "notify:less"]
			},
			injectors: {
				files: ['../content/app/**/*.js'],
				tasks: ['injector:dev'],
				options: {
					event: ['added', 'deleted']
				}
			},
			scripts: {
				files: ['../content/app/**/*.js'],
				tasks: ["concat:app"]
			}
		},
		concurrent: {
			options: {
				logConcurrentOutput: true
			},
			dev: {
				tasks: ['watch:less', 'watch:injectors', 'browserSync']
			},
			prod: {
				tasks: ['watch:less', 'watch:scripts']
			}
		},
		/*bower: {
			development: {
				dest: '../content/vendors'
			},
		},*/
		// "grunt-injector" configuration
		injector: {
			options: {
				addRootSlash: true,
				ignorePath: "../content"
			},
			dev: {
				files: {
					'../content/index.html': ['../content/vendors.js', '../content/app/**/*.js', '../content/**/*.css']
				}
			},
			default: {
				files: {
					'../content/index.html': ['../content/vendors.js', '../content/app.js', '../content/templates.js', '../content/index.css']
				}
			}
		},
		// "less"-task configuration
		less: {
			// production config is also available
			dev: {
			    options: {
					// Specifies directories to scan for @import directives when parsing.
					// Default value is the directory of the source, which is probably what you want.
					paths: ["../content/css/"],
			    },
			    files: {
					// compilation.css  :  source.less
					"../content/index.css": "../content/less/index.less"
			    }
			},
		},
		concat: {
			vendors: {
				src: [
					'./node_modules/angular/angular.js',
					'./node_modules/angular-route/angular-route.js',
					'./node_modules/angular-base64/angular-base64.js',
					'../content/js/lodash.js',
					'../content/js/dist/jquery.js',
					'./node_modules/@uirouter/angularjs/release/angular-ui-router.js',
					'./node_modules/angular-cookies/angular-cookies.js',
					'./node_modules/angular-resource/angular-resource.js',
					'./node_modules/angular-bootstrap/ui-bootstrap.js',
					'./node_modules/angular-bootstrap/ui-bootstrap-tpls.js',
					'./node_modules/restangular/dist/restangular.js',
					'./node_modules/tinymce/tinymce.js',
					'./node_modules/angular-utf8-base64/angular-utf8-base64.js',
					'../content/js/raphael.js',
					'../content/js/tinymce.theme.min.js',
				],
				dest: '../content/vendors.js',
			},
			app: {
				src: ['../content/app/**/*.js'],
				dest: '../content/app.js'
			}
		}
	});
	 // the default task (running "grunt" in console) is "watch"
	grunt.registerTask('default', ['concat', 'less', 'ngtemplates', 'injector:default', 'concurrent:prod']);

	grunt.registerTask('dev', ['concat', 'less', 'injector:dev', 'notify_hooks', 'concurrent:dev']);
};