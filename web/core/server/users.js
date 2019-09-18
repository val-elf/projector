var userModel = require('../backend/users')(),
	q = require('node-promise'),
	core = require('../backend/core'),
	Promise = q.Promise;

exports = module.exports;

exports.configure = function(app){
	app.get('/users', getUsers);
	app.get('/users/:user', getUser);
	app.put('/users', updateUser);

	app.post('/users', createUser);
	app.post('/login', loginUser);
	app.post('/logout', logoutUser);

	app.getCurrentUser = function(throwIfNotFound){
		throwIfNotFound = throwIfNotFound === undefined || throwIfNotFound;
		return _getCurrentUser.bind(app)(throwIfNotFound);
	}
};

function getUsers(key){
	console.log("[API] Get users", key);
	return userModel.find().then((function(res){
		this.response.set(res);
	}).bind(this));
}

function _getCurrentUser(throwIfNotFound){
	var _sessionId = this.request.cookies["_session"];
	if(_sessionId) {
		if(this.request.session && this.request.session.user){
			var prm = new Promise();
			prm.resolve(core.fixIds(this.request.session.user));
			return prm;
		}
		return userModel.getUserBySession(_sessionId).then((function(user){
				if(throwIfNotFound && !user)
					throw new Error('User must be authorized');
				if(this.request.session) this.request.session.user = user;
				return user;
			}).bind(this)
		);
	}
	if(throwIfNotFound)
		throw new Error('User must be authorized');
}

function getUser(key){
	console.log("[API] Get Single User", key);
	if(key.user == "current"){

		function sessionFail(){
			var err = new Error("Authorization required ");
			this.response.setError(err, 403);			
		}

		var _sessionId = this.request.cookies["_session"];
		if(_sessionId) {
			if(this.request.session && this.request.session.user){
				this.response.set(this.request.session.user);
				return;
			}
			return userModel.getUserBySession(_sessionId).then((function(user){
					if(this.request.session) this.request.session.user = user;
					this.response.set(user);
				}).bind(this), (function(error){
					console.error(error, error.stack);
					sessionFail.call(this);
				}).bind(this)
			)
		}
		sessionFail.call(this);

	} else return userModel.getUser({_id: key.user}).then((function(res){
		this.response.set(res && res[0] || null);
	}).bind(this));
}

function updateUser(key, items){
	console.log("[API] Update Users", key, items);
}

function createUser(key, items){
	console.log("[API] Create New User", key, items);
	this.response.set({abc: true})
}

function loginUser(key, items){
	console.log("[API] Login User", key, items);
	return userModel.authorize(items.login, items.password).then((function(session){
		this.response.cookies["_session"] = session._id.toString();
		this.request.session.user = null;
		this.response.set(session);
	}).bind(this), (function(error){
		this.response.setError(error, 403);
	}).bind(this));
}

function logoutUser(key, items){
	console.log("[API] Logout User", key, items);
	return userModel.logout(this.response.cookies["_session"]).then((function(){
		this.response.set(null);
	}).bind(this));
}
