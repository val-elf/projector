import React from "react";
import PropTypes from "prop-types";
import template from "./tab.template";

export class Tab extends React.Component {
	static contextTypes = {
		tabset: PropTypes.object.isRequired
	}

	constructor(props) {
		super(...arguments);
		this.index = props.index;
	}

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { active } = props;
		if (newState.initActive !== active) {
			newState.active = active;
			newState.initActive = active;
		}
		return newState;
	}

	state = {};

	componentDidMount() {
		const { active } = this.state;
		if (active) this.select();
	}

	select() {
		const { active } = this.state;
		if (!active) this.setState({ active: true });
		this.context.tabset.setActive(this);
	}

	unselect() {
		this.setState({ active: false });
	}

	render () {
		return template.call(this);
	}
}
