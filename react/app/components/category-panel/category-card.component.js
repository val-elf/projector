import React from "react";
import PropTypes from "prop-types";
import template from "./category-card.template.rt";

export class CategoryCard extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	}

	setCategoryName(value) {
		this.props.category.name = value;
	}

	render() {
		return template.call(this);
	}
}