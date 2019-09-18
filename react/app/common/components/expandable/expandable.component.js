import React from "react";
import template from "./expandable.template";
import ExpandableBody from "./expandable-body.component";
import ExpandableHead from "./expandable-head.component";

function copyChild(child, controller) {
	var res = Object.assign({
		$$typeof: child.$$typeof,
		key: child.key,
		props: {},
		ref: child.ref,
		type: child.type,
		_owner: child._owner,
		_store: child._store,
		_self: child._self,
		_source: child._source
	});
	for (var prop in child.props) res.props[prop] = child.props[prop];
	res.props.controller = controller;
	return res;
}

export default class Expandable extends React.Component {

	state = {
		expanded: false,
		controller: this
	}

	static getDerivedStateFromProps(props, state) {
		return Expandable.freshChilds(props, state);
	}

	static freshChilds(props, state){
		let head;
		let body;
		const newState = Object.assign({}, state);
		props.children.forEach(chld => {
			if (chld.type === ExpandableBody) {
				body = copyChild(chld, state.controller);
			}
			if (chld.type === ExpandableHead)
				head = copyChild(chld, state.controller);
		});
		return Object.assign(newState, {
			head,
			body
		});
	}

	setExpanded(value) {
		this.setState({ expanded: value });
		this.bodyController.setExpanded(value);
	}

	render() {
		return template.call(this);
	}
}
