import React from "react";
import PropTypes from "prop-types";
import template from "./gallery-controls.template";
import './gallery-controls.component.less';

export class GalleryControls extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired,
	};

	selectAll(value) {
		this.props.onSelectAll && this.props.onSelectAll(value);
	}

	setSearchString(value) {
	}

	render() {
		return template.call(this);
	}
}
