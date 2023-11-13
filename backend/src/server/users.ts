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
	public async getUser(key): Promise<IServerUser> {
		console.warn('[API] Get Single User', key);
		const { request, response } = this.app;
		if(key.userId === 'current'){
			const sessionFail = () => {
				const err = new Error('Authorization required ');
				response.setError(err, 401);
			}

			var _sessionId = getToken(request);
			const rsession = request.session as { user?: IServerUser };
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

		} else return await this.model.getUserWithRoles(key.userId);
	}

	// @OA:route
	// security: [APIKeyHeader:[]]
	// description: Delete particular user
	// parameters: [userId: User ID]
	// requestBody: [user]
	// responses: [200: Update existing user]
	@Route(EMethod.DELETE, '/users/:userId')
	public async deleteUser(key, user: IUser): Promise<IUser> {
		console.warn('[API] Update Users', key, user);
		return Promise.resolve(user);
	}

	// @OA:route
	// security: [APIKeyHeader:[]]
	// description: Create new user
	// requestBody: [user]
	// responses: [200: Created user]
	@Route(EMethod.POST, '/users')
	public async createUser(key, user: Pick<IUser, 'login' | 'password'>): Promise<IUser> {
		console.warn('[API] Create New User', key, user);
		const createdUser = await this.model.createUser(user);
		console.log('Result user', createdUser);
		return createdUser;
		// return { abc: true };
	}

	// @OA:route
	// description: Login
	// requestBody: [item]
	// responses: [200: Session token]
	@Route(EMethod.POST, '/login')
	public async loginUser(key, item: { login: string; password: string }): Promise<{ sessionToken: TObjectId, userId: TObjectId }> {
		const { request, response } = this.app;
		console.warn('[API] Login User', key, item);
		const session = await this.model.authorize(item.login, item.password);
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


	// @OA:route
	// description: Update user
	// security: [APIKeyHeader:[]]
	// parameters: [userId: User ID]
	// requestBody: [user]
	// responses: [200: Updated user]
	@Route(EMethod.PUT, '/users/:userId')
	public async updateUser(key, user: IUser): Promise<IUser> {
		console.warn('[API] Update User', key, user);
		return await this.model.updateUser(key.userId, user);
	}

}
