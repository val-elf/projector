import React from "react";
import PropTypes from "prop-types";
import { Tab } from "./tab.component";
import { Tabview } from "./tabview.component";
import template from "./tabset.template";
import './tabset.component.less';

export class Tabset extends React.Component {
	static childContextTypes = {
		tabset: PropTypes.object.isRequired
	}
	state = { outContents: [] };
	tabInstances = [];

	static _getTabs(children, selectedIndex) {
		let res = [];
		children = children.length ? children : [];

		children.forEach((item) => {
			if (item === null) return;
			if (item.type === Tab) {
				res.push(item);
			} else if (item instanceof Array) {
				res.push(...Tabset._getTabs(item));
			}
		});
		res = React.Children.map(res, (tab, index) => {
			const extActive = tab.props.active;
			return React.cloneElement(tab, { index, active: extActive !== undefined ? extActive : index === selectedIndex })
		});
		return res;
	}

	static _getView(children) {
		children = children.length ? children : [children];
		return children.filter(item => item && item.type === Tabview)[0];
	}

	static getDerivedStateFromProps(props, state) {
		const { tabId } = props;
		let tabIndex;
		if (tabId) {
			tabIndex = parseInt(Tabset.tabHolder[tabId], 10);
			if (isNaN(tabIndex)) tabIndex = 0;
		}
		const newState = Object.assign({
			outContents: []
		}, state, {
			tabs: Tabset._getTabs(props.children, tabIndex),
			tabIndex
		});
		const contents = newState.tabs.map(tab => tab.props.children);
		if (tabIndex !== undefined) newState.outContents[tabIndex] = contents[tabIndex];
		Object.assign(newState, { contents });

		const view = Tabset._getView(props.children);
		if (view) Object.assign(newState, { view });
		return newState;
	}

	constructor(props) {
		super(props);
		this.savePosition = !!props.savePosition;
	}

	getChildContext() {
		return { tabset: this }
	}

	static get tabHolder() {
		return JSON.parse(window.localStorage.getItem('_tabsStorage') || '{}');
	}

	static set tabHolder(value) {
		window.localStorage.setItem('_tabsStorage', JSON.stringify(value));
	}

	get contents() {
		const { contents, outContents } = this.state;
		const res = [];
		outContents.forEach((item, index) => { res[index] = contents[index]; });
		return res;
	}

	saveTabPosition(tabIndex) {
		tabIndex = tabIndex !== undefined ? tabIndex : this.state.tabIndex;
		const tabHolder = Tabset.tabHolder;
		tabHolder[this.props.tabId] = tabIndex;
		Tabset.tabHolder = tabHolder;
	}

	async setActive(tab) {
		if (this.selected === tab) return;
		if (this.selected) this.selected.unselect();
		let { outContents } = this.state;
		if (!outContents) outContents = [];
		this.selected = tab;
		const tabIndex = tab.index;

		if (!outContents[tab.index]) outContents[tab.index] = true;
		if (this.savePosition && this.props.tabId) this.saveTabPosition(tabIndex);
		this.setState({ tabIndex, outContents });
	}

	render () {
		return template.call(this);
	}
}
