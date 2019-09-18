var userModel = require("./core").model("users"),
	sessions = require("./core").model("sessions"),
	roles = require('./core').model('roles'),
	extend = require("extend"),
	md5 = require('md5');

module.exports = function(){
	return extend({}, {
		getUser: function(userId){
			return userModel.find({_id: userId}).then(function(usersList){
				var user = usersList[0];
				if(user._doc.roles && user._doc.roles.length){
					return roles.find({_id: {$in: user._doc.roles}}).then(function(roles){
						user._doc.roles = roles.map(function(rl){return rl._doc});
						delete user._doc.password;
						return user._doc;
					})
				} else return user._doc;
			});
		},
		getList: function(){
			return userModel.find().then(function(usersList){
				return usersList;
			});
		},
		getUserBySession: function(sessionId){
			return sessions.find({_id: sessionId, expired: {$ne: true } }).then((function(sessionItem){
				if(sessionItem && sessionItem[0]){
					var itm = sessionItem.pop()._doc;
					return this.getUser(itm.user);
				} else throw new Error("Session not found");
			}).bind(this));
		},
		authorize: function(login, password){
			return userModel.find({login: login || '', password: md5(password || '')}).then(function(user){
				if(user && user.length){
					//user was found
					var auser = user.pop();
					//generate session
					return sessions.create({user: auser._doc._id}).then(function(session){
						session.user = auser._doc;
						return session;
					});
				}
				throw new Error("User not found");
			});
		},
		logout: function(sessionId){
			return sessions.update({_id: sessionId}, {expired:true }).then(function(){
				return true;
			});
		}
	});
};