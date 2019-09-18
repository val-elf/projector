import React from "react";
import template from "./expandable-head.template";

export default class ExpandableHead extends React.Component {
	constructor() {
		super(...arguments);
		this.state = {
			expanded: false
		}
		this.controller = this.props.controller;
	}

	async toggleExpanded() {
		const expanded = !this.state.expanded;
		await this.setState({ expanded });
		this.controller.setExpanded(expanded);
	}

	render() {
		return template.call(this);
	}
}
