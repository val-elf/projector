import { IRouter } from '../backend/core/models';
import { Users } from '../backend';
import { Service } from '../network/service';
import { getToken } from '~/backend/entities/utils';

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
	}

	getUsers = async (key) => {
		console.warn("[API] Get users", key);
		return await this.model.getList();
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
			const rsession = request.session as any;
			if(_sessionId) {
				if(rsession && rsession.user){
					return rsession.user;
				}
				try{
					const user = await this.model.getUserBySession(_sessionId);
					if(rsession) {
						rsession.user = user;
					}
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
		(request.session as any).user = null;
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
