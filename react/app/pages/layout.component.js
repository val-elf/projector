import React from 'react';
import PropTypes from 'prop-types';
import { UIView } from '@uirouter/react';
import { TopNavigation } from "components/navigation";

export class Layout extends React.Component{
	static childContextTypes = {
		stateService: PropTypes.object.isRequired,
		router: PropTypes.object.isRequired
	}

	getChildContext() {
		return {
			stateService: this.router.stateService,
			router: this.router
		};
	}

	componentDidMount(){
		var rt = this.router,
			_this = this;
		rt.transitionService.onSuccess({}, () => {
			this.forceUpdate()
		});
	}

	get router() { return this.props.transition.router; }

	render(){
		return (
			<div className="layout">
				<TopNavigation />
				<div className="content col">
					<UIView />
				</div>
				<div className="footer">
					Wnut (c) 2015
				</div>
			</div>
		);
	}
}