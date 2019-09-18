import React from "react";
import PropTypes from "prop-types";
import template from "./popup.template";

export class Popup extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	};

	constructor() {
		super(...arguments);
		this.state = {
			showPanel: false,
		};
	}

	rootRef = React.createRef();
	panelRef = React.createRef();
	get root() { return this.rootRef.current; }
	get panel() { return this.panelRef.current; }

	componentDidMount() {
		// append controllers to parent element
		document.body.appendChild(this.panel);

		this.parent = this.root.parentNode;

		const blur = this.panel.querySelector(".blur");

		this.toggler = event => this.togglePanel(event, !this.state.showPanel);

		this.parent.addEventListener('click', this.toggler);
		this.panel.addEventListener('click', event => {
			event.target === blur && event.stopPropagation()
		});
	}

	componentWillUnmount() {
		document.body.removeChild(this.panel);
	}

	togglePanel(event, toState) {
		if (toState) {
			const bounding = this.root.getBoundingClientRect();
			const { left, top } = bounding;
			const height = this.parent.offsetHeight;
			Object.assign(this.panel.style, {
				left: `${left}px`,
				top: `${top + height}px`,
			});

			this.setState({
				showPanel: toState
			});
			setTimeout(() => {
				this.panel.classList.add("active");
				document.addEventListener('click', this.toggler);
			});
		} else {
			document.removeEventListener('click', this.toggler);
			this.panel.classList.remove("active");
			this.panel.addEventListener('transitionend', this.transitionHandler);
		}
	}

	transitionHandler = () => {
		this.panel.removeEventListener('transitionend', this.transitionHandler);
		this.setState({
			showPanel: false
		});
	}

	render() {
		return template.call(this);
	}
}
