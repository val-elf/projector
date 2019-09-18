import React from "react";
import PropTypes from "prop-types";
import template from "./gallery.template";

export class Gallery extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	}

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { owner, count } = props;
		if (owner && state.owner !== owner) newState.owner = owner;
		if (state.count !== count) newState.count = count;
		return newState;
	}

	galleryRef = React.createRef();
	get gallery() { return this.galleryRef.current; }

	state = {
		count: 20,
		galleryType: 'bricks'
	}

	async selectCategory(selected){
		await this.setState({ selected });
		this.gallery.refreshGallery();
	}

	render() {
		return template.call(this);
	}
}