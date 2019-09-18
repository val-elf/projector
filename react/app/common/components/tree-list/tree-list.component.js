import React from "react";
import PropTypes from "prop-types";
import template from "./tree-list.template";
import { TreeListItem } from "./tree-list-item.component";
import './tree-list.component.less';

export class TreeList extends React.Component {
	static childContextTypes = {
		listController: PropTypes.object
	}

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { selected, source } = props;
		if (selected !== newState.selected) newState.selected = selected;
		if (source !== newState.source) newState.source = source;
		return newState;
	}

	state = {};

	getChildContext() {
		return { listController: this}
	}

	expandSelected() {
		this.selectedNode && this.selectedNode.expandParentBranch();
	}

	async setSelected(item){
		await this.setState({ selected: item });
		if (this.props.onSelect) this.props.onSelect(item);
	}

	renderer(item, node) {
		return this.props[this.props.renderer](item, node);
	}

	render() {
		return template.call(this);
	}
}

