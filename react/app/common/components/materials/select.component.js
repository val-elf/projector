import React from "react";
import template from "./select.template";

export class Select extends React.Component {

	static getDerivedStateFromProps(props) {
		return {
			value: props.value,
			defaultValue: props.defaultValue
		};
	}

	state = { value: '' };

	render() {
		return template.call(this);
	}
}