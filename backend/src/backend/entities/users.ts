import { DbBridge, DbModel } from "../core";
import md5 from "md5";
import { IUser, IRole, ISession, IServerUser, IInitUser } from './models';
import { PermissionsCheck } from './decorators/permissions-check';
import { DbObjectAncestor } from './dbbase';
import { TObjectId } from '../core/models';

@DbModel({ model: 'users' })
export class Users extends DbObjectAncestor<IUser, IInitUser> {
	private roles = DbBridge.getBridge<IRole>('roles');
	private sessions = DbBridge.getBridge<ISession>('sessions');

	public async getUser(userId?: TObjectId): Promise<IUser> {
		if (!userId) {
			return await this.getCurrentUser();
		}
		return await this.model.getItem(userId);
	}

	public async getUserWithRoles(userId): Promise<IServerUser> {
		const user = await this.model.getItem(userId);
		const result: IServerUser = { ...user, roles: [] };
		if(user._roles && user._roles.length) {
			const roles = await this.roles.find({ _id: {$in: user._roles }});
			result.roles = roles;
			delete user.password;
		}
		return result;
	}

	@PermissionsCheck({ permissions: [] })
	public getList() {
		return this.model.find();
	}

	public async isSessionExpired(sessionId) {
		const session = await this.sessions.getItem(sessionId);
		return session.expired;
	}

	public async getUserBySession(sessionId) {
		const sessionItems = await this.sessions.find(this.fixIds({ _id: sessionId, expired: { $ne: true } }));
		if(sessionItems && sessionItems[0]) {
			const itm = sessionItems[0];
			return this.getUserWithRoles(itm.user);
		} else throw new Error("Session not found");
	}

	public async authorize(login, password) {
		password = md5(`${login}:${password}`);
		const user = await this.model.find({ login: login || '', password });
		if(user && user.length){
			//user was found
			const auser = user.pop();
			//generate session
			const session = await this.sessions.create({user: auser._id});
			session.user = auser._id;
			return session;
		}
		throw new Error("User or password is incorrect");
	}

	public async createUser(user: Pick<IInitUser, "login" | "password">) {
		user.password = md5(`${user.login}:${user.password}`);
		return await this.model.create(user);
	}

	public async updateUser(userId: TObjectId, user: IInitUser): Promise<IUser> {
		return await this.model.updateItem(user);
	}


	public async logout(sessionId) {
		await this.sessions.update({ _id: sessionId }, { expired: true });
		return true;
	}
};