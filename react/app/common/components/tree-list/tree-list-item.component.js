import React from "react";
import PropTypes from "prop-types";
import template from "./tree-list-item.template";

export class TreeListItem extends React.Component {
	static contextTypes = {
		listController: PropTypes.object.isRequired
	}

	state = {};

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { selected } = props;
		if (newState.selected !== selected) newState.selected = selected;
		return newState;
	}

	componentDidMount() {
		if (this.isSelected) this.expandParentBranch();
	}

	componentDidUpdate(pprops, pstate) {
		const { selected } = this.state;
		if (selected !== pstate.selected && this.item === selected) {
			this.expandParentBranch();
		}
	}

	toggleOpen(event, value) {
		const { item } = this.props;
		const { children } = item;
		value = value !== undefined ? value : !this.state.opened;
		event && event.stopPropagation();
		if (!children || !children.length) return;
		this.setState({
			opened: value
		});
	}

	select(){
		this.context.listController.setSelected(this.item);
	}

	get opened() {
		return this.state.opened;
	}

	get parent() {
		return this.props.parent;
	}

	get item() { return this.props.item };

	get expanded() {
		let parent = this.props.parent;
		while (parent) {
			if (!parent.opened) return false;
			parent = parent.parent;
		}
		return true;
	}

	expandParentBranch(expandSelf) {
		if (!this.opened && expandSelf) {
			this.toggleOpen(undefined, true);
		}
		this.props.parent && this.props.parent.expandParentBranch(true);
	}

	get isSelected() {
		return this.item === this.props.selected;
	}

	renderChild(child) {
		return (<TreeListItem renderer={this.props.renderer} item={child} key={child.id} parent={this} selected={this.props.selected} />);
	}

	isOnViewport() {
		const { element: el} = this;
		if (!el) return true;
		const rect = el.getBoundingClientRect();
		const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
		const windowWidth = (window.innerWidth || document.documentElement.clientWidth);
		const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
		const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

		return (vertInView && horInView);
	}

	render() {
		if (this.state.selected && !this.isOnViewport()) this.element.scrollIntoView(false);
		return template.call(this);
	}
}

