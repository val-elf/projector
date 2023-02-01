import { IRouter } from '../backend/core/models';
import { Users } from '../backend';
import { Service } from '../network/service';

const USER_LOGOUT_MESSAGE = "User must be authorized";
const AUTH_HEADER = 'authorization';

export class UsersRouter implements IRouter {
	model: Users;
	onceSession: boolean;
	private app: Service;

	configure(app: Service) {
		this.model = new Users(app);
		this.app = app;
		app.for(this.model)
			.get('/users', this.getUsers)
			.get('/users/:user', this.getUser)
			.put('/users', this.updateUser)
			.post('/users', this.createUser)
			.post('/login', this.loginUser)
			.post('/logout', this.logoutUser)
		;

		/*
		app.getCurrentUser = function(throwIfNotFound){
			throwIfNotFound = throwIfNotFound === undefined || throwIfNotFound;
			return this._getCurrentUser(this, throwIfNotFound);
		}

		app.setOnceSession = function(session) {
			this.onceSession = session;
		}
		*/
	}


	private getCurrentSession() {
		const session = this.onceSession || getToken(this.app.request);
		if (this.onceSession) delete this.onceSession;
		return session;
	}

	getUsers = async (key) => {
		console.warn("[API] Get users", key);
		return await this.model.getList();
	}

	private async _getCurrentUser(throwIfNotFound){
		var sessionId = this.getCurrentSession();
		const { request } = this.app;
		const throwError = () => {
			throw {
				message: new Error(USER_LOGOUT_MESSAGE),
				code: 403
			};
		}
		if(sessionId) {
			const rsession = request.session;
			if(rsession && rsession.id === sessionId && rsession.user){
				return request.session.user;
			}
			try{
				const user = await this.model.getUserBySession(sessionId);
				if(user) {
					if(request.session) {
						request.session.user = user;
						request.session.id = sessionId;
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

	getUser = async (key) => {
		console.warn("[API] Get Single User", key);
		const { request, response } = this.app;
		if(key.user == "current"){
			const sessionFail = () => {
				const err = new Error("Authorization required ");
				response.setError(err, 401);
			}

			var _sessionId = getToken(request);
			if(_sessionId) {
				if(request.session && request.session.user){
					return request.session.user;
				}
				try{
					const user = await this.model.getUserBySession(_sessionId);
					if(request.session) request.session.user = user;
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

	updateUser = async (key, items) => {
		console.warn("[API] Update Users", key, items);
	}

	createUser = async (key, items) => {
		console.warn("[API] Create New User", key, items);
		return { abc: true };
	}

	loginUser = async (key, items) => {
		const { request, response } = this.app;
		console.warn("[API] Login User", key, items);
		const session = await this.model.authorize(items.login, items.password);
		request.session.user = null;
		response.cookies['session_id'] = { value: session._id.toString() };
		return session;
	}

	logoutUser = async (key, items) => {
		const { request, response } = this.app;
		console.warn("[API] Logout User", key, items);
		await this.model.logout(getToken(request));
		response.cookies['session_id'] = { value: undefined };
		return { logout: true };
	}

}

function getToken(request) {
	const isAuth = request.headers[AUTH_HEADER] || null;
	return isAuth;
}