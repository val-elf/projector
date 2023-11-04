import { IRouter, TObjectId } from '../backend/core/models';
import { Users } from '../backend';
import { Service } from '../network/service';
import { getToken } from '~/backend/entities/utils';
import { IServerUser, IUser } from '~/backend/entities/models';
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
	// security: [APIKeyHeader:[]]
	// description: Get list of users
	// responses: [200: List of users]
	@Route(EMethod.GET, '/users')
	public async getUsers(key): Promise<IUser[]> {
		console.warn('[API] Get users', key);
		return await this.model.getList();
	}

	// @OA:route
	// security: [APIKeyHeader:[]]
	// description: Get single user
	// parameters: [userId: User ID]
	// responses: [200: User instance]
	@Route(EMethod.GET, '/users/:userId')
	public async getUser(key): Promise<IUser | IServerUser> {
		console.warn('[API] Get Single User', key);
		const { request, response } = this.app;
		if(key.userId === 'current'){
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

		} else return await this.model.getUser(key.userId);
	}

	// @OA:route
	// security: [APIKeyHeader:[]]
	// description: Delete particular user
	// parameters: [userId: User ID]
	// responses: [200: Update existing user]
	@Route(EMethod.DELETE, '/users/:userId')
	public async updateUser(key, user: IUser): Promise<IUser> {
		console.warn('[API] Update Users', key, user);
		return Promise.resolve(user);
	}

	// @OA:route
	// security: [APIKeyHeader:[]]
	// description: Create new user
	// requestBody: [item: IUser]
	// responses: [200: Created user]
	@Route(EMethod.POST, '/users')
	public async createUser(key, items: Pick<IUser, 'login' | 'password'>): Promise<IUser> {
		console.warn('[API] Create New User', key, items);
		const user = await this.model.createUser(items);
		console.log('Result user', user);
		return user;
		// return { abc: true };
	}

	// @OA:route
	// description: Login
	// requestBody: [item: IUser]
	// responses: [200: Session token]
	@Route(EMethod.POST, '/login')
	public async loginUser(key, items): Promise<{ sessionToken: TObjectId, userId: TObjectId }> {
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
	// responses: [200: Logout flag]
	@Route(EMethod.POST, '/logout')
	public async logoutUser(key): Promise<{ logout: boolean }> {
		const { request, response } = this.app;
		console.warn('[API] Logout User', key);
		await this.model.logout(getToken(request));
		response.cookies['session_id'] = { value: undefined };
		return { logout: true };
	}

}
