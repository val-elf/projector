import React from "react";
import PropTypes from "prop-types";
import template from "./documents-panel.template";

export class DocumentsPanel extends React.Component {

	render() {
		return template.call(this);
	}
}

DocumentsPanel.contextTypes = {
	t: PropTypes.func.isRequired
}
