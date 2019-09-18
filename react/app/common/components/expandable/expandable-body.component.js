import React from "react";
import template from "./expandable-body.template";

export default class ExpandableBody extends React.Component {
	constructor() {
		super(...arguments);

		if (this.props.controller) {
			this.props.controller.bodyController = this;
		}

		this.state = {
			expanded: false
		}
	}

	bodyRef = React.createRef();
	get body() { return this.bodyRef.current }

	refineState() {
		if (!this.state.expanded) {
			Object.assign(this.body.style, { height: 0 });
			return;
		}

		const clone = this.body.cloneNode(true);
		const { parentNode } = this.body;
		clone.classList.add("mesure");
		Object.assign(clone.style, {height: ''});
		parentNode.appendChild(clone);
		setTimeout(() => {
			var height = clone.offsetHeight;
			Object.assign(this.body.style, { height: `${height}px` });
			parentNode.removeChild(clone);
		});
	}

	componentDidMount() {
		const mut = new MutationObserver(_ => this.refineState());
		mut.observe(this.body, { childList: true, subtree: true });
	}

	setExpanded(value) {
		this.setState({ expanded: value });
		this.refineState();
	}

	render() {
		return template.call(this);
	}
}
