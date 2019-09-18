import React from "react";
import template from "./dynamic-list.template.rt";

export class DynamicList extends React.Component {
	render() {
		return template.call(this);
	}
}