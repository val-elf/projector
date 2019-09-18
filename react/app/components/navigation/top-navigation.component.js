import React from "react";
import { UISref } from "@uirouter/react";
import { loginService } from "projector/components/authorization";
import PropTypes from "prop-types";
import template from "./top-navigation.template";

export class TopNavigation extends React.Component {
	static contextTypes = {
		router: PropTypes.object,
		navigation: PropTypes.array,
		t: PropTypes.func.isRequired,
	};

	constructor(props, context){
		super(props, context);
		this.state = {
			user: {}
		};
		this.navigation = this.context.navigation;

		loginService.getCurrentUser().then( user => {
			this.setState({
				user: user
			});
		});
	}

	logout() {
		loginService.logout();
	}

	renderNavItem(state){
		const router = this.context.router;
		const service = router.stateService;
		const rstate = service.get(state.name);
		let link;
		const isSelected = service.includes(rstate.name, {});
		const isActive = service.is(rstate.name, {});
		const { t } = this.context;
		if (isActive)
			link = <span>{ t(`NAV_${state.description}`) }</span>;
		else
			link = <UISref to={state.name}><a>{ t(`NAV_${state.description}`) }</a></UISref>;

		return (
			<div className={isSelected ? 'menu-item selected' : 'menu-item'}>
				{link}
			</div>
		);
	}

	render() {
		return template.call(this);
	}
}

