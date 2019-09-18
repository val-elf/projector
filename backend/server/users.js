const Users = require('../backend/users');
const { Core } = require('../backend/core');
const _exports = module.exports;

const authHeader = 'authorization';

function getToken(request) {
	const isAuth = request.cookies['session_id'] || null;
	return isAuth;
}

_exports.configure = function(app){

	const userModel = new Users(app);

	app.for(userModel)
		.get('/users', getUsers)
		.get('/users/:user', getUser)
		.put('/users', updateUser)
		.post('/users', createUser)
		.post('/login', loginUser)
		.post('/logout', logoutUser)
	;

	app.getCurrentUser = function(throwIfNotFound){
		throwIfNotFound = throwIfNotFound === undefined || throwIfNotFound;
		return _getCurrentUser.call(app, userModel, throwIfNotFound);
	}

	app.getCurrentSession = function() {
		const session = this.onceSession || getToken(this.request);
		if (this.onceSession) delete this.onceSession;
		return session;
	}

	app.setOnceSession = function(session) {
		this.onceSession = session;
	}
};

const userLogoutMessage = "User must be authorized";

async function getUsers(key){
	console.log("[API] Get users", key);
	return await this.model.getList();
}

async function _getCurrentUser(model, throwIfNotFound){
	var sessionId = this.getCurrentSession();
	const throwError = () => { throw new Error(userLogoutMessage); }
	if(sessionId) {
		const rsession = this.request.session;
		if(rsession && rsession.id === sessionId && rsession.user){
			return this.request.session.user;
		}
		try{
			const user = await model.getUserBySession(sessionId);
			if(user) {
				if(this.request.session) {
					this.request.session.user = user;
					this.request.session.id = sessionId;
				}
				return user;
			}
		}
		catch(error){
			throwError();
		};
	}
	if(throwIfNotFound) {
		throwError();
	}
}

async function getUser(key){
	console.log("[API] Get Single User", key);
	if(key.user == "current"){
		const sessionFail = () => {
			var err = new Error("Authorization required ");
			this.response.setError(err, 401);
		}

		var _sessionId = getToken(this.request);
		if(_sessionId) {
			if(this.request.session && this.request.session.user){
				return this.request.session.user;
			}
			try{
				const user = await this.model.getUserBySession(_sessionId);
				if(this.request.session) this.request.session.user = user;
				return user;
			}
			catch(error) {
				console.error(error, error.stack);
				sessionFail();
			};
		}
		sessionFail();

	} else return await this.model.getUser(key.user);
}

async function updateUser(key, items){
	console.log("[API] Update Users", key, items);
}

async function createUser(key, items){
	console.log("[API] Create New User", key, items);
	return { abc: true };
}

async function loginUser(key, items){
	console.log("[API] Login User", key, items);
	const session = await this.model.authorize(items.login, items.password);
	this.request.session.user = null;
	this.response.cookies['session_id'] = { value: session._id.toString() };
	return session;
}

async function logoutUser(key, items){
	console.log("[API] Logout User", key, items);
	await this.model.logout(getToken(this.request));
	this.response.cookies['session_id'] = { value: undefined };
	return { logout: true };
}
