//generate database by client

var core = require('./core.js'),
	utils = require('./utils.js'),
	q = require('node-promise')
;
var sessionId, user;

core.post('/srv/:login', {login: 'login'}, {login: 'test', password: 'test'}).then(function(data){
	sessionId = data._id;
	user = data.user;

	core.setCookie("_session", sessionId);

	/* generate projects */
	q.all(generateProjects()).then(function(){
		console.log("Generation projects ends");
	});
});

function generateProjects(){
	var res = [], i = 0;

	function run(last){
		if(i > 10) return last;

		i++;
		var a = utils.genPhrase(1, 3, 20, true),
			b = core.post('/srv/projects', {}, {
			name: a
		});

		b.then(function(){
			return run(b);
		});
	}

	return [run()];
}


process.on('uncaughtException', function(err){
	console.log("ERR caught", err);
})

