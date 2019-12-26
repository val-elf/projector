import React from "react";
import PropTypes from "prop-types";
import template from "./character-page.template";
import { ModalService } from 'controls/materials';
import { CharacterCard } from 'components/characters';

export class CharacterPage extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	}

	static getDerivedStateFromProps(props, state) {
		const { character } = props;
		return Object.assign({
			character
		}, state);
	}

	state = {};

	get artifacts() {
		if (this.state.artifacts) return this.state.artifacts;
		(async () => {
			const artifacts = await this.state.character.involvement.getList({});
			this.setState({ artifacts });
			return artifacts;
		})();
		return [];
	}

	async editCharacter() {
		const { character } = this.state;
		try {
			await ModalService.open(CharacterCard, {
				title: { propName: 'character.name', defaultValue: this.context.t('APP_CHARACTER_NEW')},
				content: { character }
			});
			const newChar = await character.save();
			this.setState({ character: newChar });
		} catch (error) { }
	}

	render() {
		return template.call(this);
	}
}