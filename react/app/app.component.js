import React from 'react';
import '~/api/models';
import PropTypes from 'prop-types';
import axios from 'axios';
import { loginService } from 'components/authorization/authorization.component';
import navigation from 'components/navigation/navigation.module';
import 'tinymce/themes/modern';
import { apiUrl } from "~/index";
import template from './app.template';
import { AppContext } from './app.context';
import { mutator } from './services/state-management/state.manager';

export class App extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired,
	}

	static childContextTypes = {
		navigation: PropTypes.array.isRequired
	}

	service = loginService;
	state = {};
	_navigation = navigation._map;

	_modal = React.createRef();
	static get modal() {
		return App.instance._modal.current;
	}

	getChildContext() {
		const { _navigation: navigation } = this;
		return { navigation };
	}

	async _loadNavigation(){
		try {
			const data = await axios.get(`${apiUrl}navigation`);
			this._navigation = navigation.apply(data.data);
			this.setState({ navigation: this._navigation.flat() });
		} catch(err) {
			this.service.unauthorize();
			this.setState({ navigation: [] });
		}
	}

	componentDidUpdate() {
		App.instance = this;
	}

	componentDidMount(){
		App.instance = this;
		this.service.on('logout', ()=>{
			this.setState({
				navigation: []
			});
		});

		if(this.service.authorized)
			this._loadNavigation();
	}

	authorize() {
		this._loadNavigation();
	}

	render() {
		return template.call(this);
	}
}
