import { DbBridge, DbModel } from "../core/db-bridge";
import md5 from "md5";
import { DbObjectAncestor } from './dbobjects';
import { IUser, IRole, ISession } from './models/db.models';

@DbModel({model: 'users' })
export class Users extends DbObjectAncestor<IUser> {
	private roles = DbBridge.getBridge<IRole>('roles');
	private sessions = DbBridge.getBridge<ISession>('sessions');

	async getUser(userId) {
		const user = await this.model.getItem(userId);
		if(user.roles && user.roles.length) {
			const roles = await this.roles.find({ _id: {$in: user.roles }});
			user.roles = roles;
			delete user.password;
			return user;
		} else return user;
	}

	getList() {
		return this.model.find();
	}

	async isSessionExpired(sessionId) {
		const session = await this.sessions.getItem({ id: sessionId });
		return session.expired;
	}

	async getUserBySession(sessionId) {
		const sessionItems = await this.sessions.find({ _id: sessionId, expired: { $ne: true } });
		if(sessionItems && sessionItems[0]) {
			const itm = sessionItems[0];
			return this.getUser(itm.user);
		} else throw new Error("Session not found");
	}

	async authorize(login, password) {
		const user = await this.model.find({login: login || '', password: md5(password || '')});
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

	async logout(sessionId) {
		await this.sessions.update({ _id: sessionId }, { expired: true });
		return true;
	}
};