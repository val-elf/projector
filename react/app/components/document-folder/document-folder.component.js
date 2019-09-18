import React from "react";
import PropTypes from "prop-types";
import template from "./document-folder.template";
import './document-folder.component.less';

export class DocumentFolder extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	}
	static getDerivedStateFromProps(props) {
		return {
			owner: props.owner,
			type: props.type
		}
	}

	state = {};

	reachSide(side) {
		if (side === 'bottom') {
			this.props.onScrollEnd && this.props.onScrollEnd();
		}
	}

	render() {
		return template.call(this);
	}
}
