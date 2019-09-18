const { Core, CommonEntity } = require("./core");
const md5 = require('md5');
const userModel = Core.getModel("users");
const sessions = Core.getModel("sessions");
const rolesModel = Core.getModel('roles');

module.exports = class Users extends CommonEntity {
	async getUser(userId) {
		const user = await userModel.getItem(userId);
		if(user.roles && user.roles.length) {
			const roles = await rolesModel.find({ _id: {$in: user.roles }});
			user.roles = roles;
			delete user.password;
			return user;
		} else return user;
	}

	getList() {
		return userModel.find();
	}

	async isSessionExpired(sessionId) {
		const session = await sessions.getItem({ id: sessionId });
		return session.expired;
	}

	async getUserBySession(sessionId) {
		const sessionItems = await sessions.find({ _id: sessionId, expired: { $ne: true } });
		if(sessionItems && sessionItems[0]) {
			var itm = sessionItems[0];
			return this.getUser(itm.user);
		} else throw new Error("Session not found");
	}

	async authorize(login, password) {
		const user = await userModel.find({login: login || '', password: md5(password || '')});
		if(user && user.length){
			//user was found
			var auser = user.pop();
			//generate session
			const session = await sessions.create({user: auser._id});
			session.user = auser;
			return session;
		}
		throw new Error("User or password is incorrect");
	}

	async logout(sessionId) {
		await sessions.update({ _id: sessionId }, { expired: true });
		return true;
	}
};