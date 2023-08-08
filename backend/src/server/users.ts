import { IRouter } from '../backend/core/models';
import { Users } from '../backend';
import { Service } from '../network/service';
import { getToken } from '~/backend/entities/utils';
import { IUser } from '~/backend/entities/models';
import { Route, Router } from '~/network';
import { EMethod } from '~/network/route.decorator';

// @OA:tag
// name: Users
// description: Users management API
@Router()
export class UsersRouter implements IRouter {
	model: Users;
	onceSession: boolean;
	private app: Service;

	configure(app: Service) {
		this.model = new Users(app);
		this.app = app;
	}

	// @OA:route
	// description: Get list of users
	@Route(EMethod.GET, '/users')
	public async getUsers(key) {
		console.warn('[API] Get users', key);
		return await this.model.getList();
	}

	// @OA:route
	// description: Get single user
	@Route(EMethod.GET, '/users/:user')
	public async getUser(key) {
		console.warn('[API] Get Single User', key);
		const { request, response } = this.app;
		if(key.user === 'current'){
			const sessionFail = () => {
				const err = new Error('Authorization required ');
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

	// @OA:route
	// description: Delete particular user
	@Route(EMethod.DELETE, '/users/:user')
	public async updateUser(key, items) {
		console.warn('[API] Update Users', key, items);
	}

	// @OA:route
	// description: Update particular user
	@Route(EMethod.POST, '/users')
	public async createUser(key, items: Pick<IUser, 'login' | 'password'>) {
		console.warn('[API] Create New User', key, items);
		const user = await this.model.createUser(items);
		console.log('Result user', user);
		return user;
		// return { abc: true };
	}

	// @OA:route
	// description: Login
	@Route(EMethod.POST, '/login')
	public async loginUser(key, items) {
		const { request, response } = this.app;
		console.warn('[API] Login User', key, items);
		const session = await this.model.authorize(items.login, items.password);
		if (request.session) {
			(request.session as any).user = null;
		}
		response.cookies['session_id'] = { value: session._id.toString() };
		return {
			sessionToken: session._id,
			userId: session.user,
		};
	}

	// @OA:route
	// description: Logout
	@Route(EMethod.POST, '/logout')
	public async logoutUser(key, items) {
		const { request, response } = this.app;
		console.warn('[API] Logout User', key, items);
		await this.model.logout(getToken(request));
		response.cookies['session_id'] = { value: undefined };
		return { logout: true };
	}

}
