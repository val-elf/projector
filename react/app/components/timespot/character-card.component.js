import React from "react";
import PropTypes from "prop-types";
import { DocumentsService } from 'api';
import template from "./character-card.template";

export class CharacterCard extends React.Component {
	state = {};

	static contextTypes = {
		t: PropTypes.func.isRequired
	}

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { character, spot } = props;
		if (!character.document) {
			character.document = DocumentsService.create();
			(async() => {
				await character.document.save();
				await spot.save();
			})();
		}
		newState.document = character.document;

		if (character !== newState.character) {
			newState.character = character;
		}
		if (spot !== newState.spot) newState.spot = spot;
		return newState;
	}

	async saveCharacterDescription() {
		const { document, spot } = this.state;
		const created = !document.id;
		await document.save();
		if (created) await spot.save();
	}

	handleChangeDescription(content) {
		const { document } = this.state;
		document.content = content;
	}

	render() {
		return template.call(this);
	}
}
