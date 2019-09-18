import React from "react";
import PropTypes from "prop-types";
import template from "./authorization.template";
import axios from "axios";
import { apiUrl } from "projector/index";
import './authorization.less';

export const loginService = {
	_events: {},
	authorized: !!localStorage.getItem('session'),
	login: function(login, password){
		return axios.post(`${apiUrl}login`,
			{
				login: login,
				password: password
			}
		).then(result => {
			const data = result.data;
			this.authorized = true;
			localStorage.setItem('session', data._id);
			return data;
		}, error => {
			this.authorized = false;
			throw error;
		});
	},
	getCurrentUser: function(){
		return axios.get(`${apiUrl}users/current`).then(data => {
			return data.data;
		});
	},
	on: function(event, cb){
		var ec = !this._events[event] ? (this._events[event] = []) : this._events[event];
		ec.push(cb);
	},
	logout: function(){
		return axios.post(`${apiUrl}logout`, {}).then( (data) => {
			this.authorized = false;
			localStorage.removeItem('session');
			this._events['logout'] && this._events['logout'].some(function(cb){
				cb({});
			})
		});
	},
	unauthorize() {
		this.authorized = false;
	}
}

export class Login extends React.Component{
	constructor(props) {
		super(props);
		this.authData = {};
	}

	auth(){
		loginService.login(
			this.authData.login,
			this.authData.password
		).then(data => {
			if (this.props.onAuthorize) this.props.onAuthorize(data);
			this.setState({ authorized: true });
		}, error => {
			console.error(error);
			var resp = error.response.data;
			this.error = resp && resp._error && resp._error.message || 'Unknown error';
			this.props.onFault && this.props.onFault();
		});
	}

	handleChange(inputType) {
		return (e) => {
			this.authData[inputType] = e.target.value;
		};
	}

	render(){
		return template.call(this);handleChange
	}
};

Login.loginService = loginService;

Login.contextTypes = {
	t: PropTypes.func.isRequired,
}