import React from "react";
import PropTypes from "prop-types";
import template from "./character-card.template.rt";
import { CharacterTypes, CharacterDate } from "api";

export class CharacterCard extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	}

	static getDerivedStateFromProps(props) {
		return {
			character: props.character
		};
	}

	state = {};
	characterTypes = CharacterTypes;

	handleChange(field) {
		const { character } = this.state;
		return (evt) => {
			character[field] = evt.target.value;
			this.setState({ character });
		}
	}

	changeCharacterType(evt) {
		const { character } = this.state;
		character.type = evt.target.value;
		this.setState({ character });
	}

	setTypeTo(value, container) {
		const { character } = this.state;
		container.type = value;
		this.setState({ character });
	}

	setDateTo(value, container) {
		const { character } = this.state;
		container.date = value.toDate();
		this.setState({ character });
	}

	addDate() {
		const { character } = this.state;
		const dates = character.dates;
		dates.push(CharacterDate.create({
			type: '',
			date: null
		}));
		character.dates = dates;
		this.setState({ character });
	}

	removeDate(container) {
		const { character } = this.state;
		const { dates } = character;
		const index = dates.indexOf(container);
		if (index > -1) dates.splice(index, 1);
		this.setState({ character });
	}

	setPreview(preview) {
		const { character } = this.state;
		character.preview = preview;
		this.setState({ character });
	}

	render() {
		return template.call(this);
	}
}