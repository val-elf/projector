import React from "react";
import PropTypes from "prop-types";
import { TimespotCharacter } from 'api';
import { ModalService } from 'common/materials';
import { CharactersSelector } from './modals/characters-selector.component';
import template from "./characters-panel.template";

export class CharactersPanel extends React.Component {

	static contextTypes = {
		t: PropTypes.func.isRequired,
		project: PropTypes.object.isRequired
	}

	state = {
		characters: []
	};

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { spot } = props;
		if (spot !== state.spot) Object.assign(newState, { spot });
		return newState;
	}

	async getSpotCharacters(spot) {
		const characters = (await Promise.all(spot.characters.map(async char => {
			await char.character;
			await char.document;
			return char;
		}))).filter(char => char.character);
		const project = await spot.timeline.project;
		if (this._isUnmount) return;
		if (characters) this.setState({ characters });
		const { count } = await project.characters.getList({ totalCount: true });
		if (this._isUnmount) return;
		this.setState({ totalCharacters: count })
	}

	componentWillUnmount() {
		this._isUnmount = true;
	}

	shouldComponentUpdate(newProps, newState) {
		const { spot } = newState;
		if (spot !== this.state.spot) this.getSpotCharacters(spot);
		return true;
	}

	componentDidMount() {
		this.getSpotCharacters(this.state.spot);
	}

	async assignCharacters() {
		const { characters, spot } = this.state;
		const { project } = this.context;
		try {
			const selected = {};
			await ModalService.open(CharactersSelector, {
				title: this.context.t('APP_TIMESPOT_SELECT_CHARACTERS'),
				content: { characters, project, selected }
			});
			for (const id of Object.keys(selected)) {
				characters.push(TimespotCharacter.create({
					character: selected[id],
				}));
			}
			spot.characters = characters;
			await spot.save();
			this.setState({ characters, spot });
		} finally { }
	}

	selectCharacter(character) {
		let isSelect = !this.props.onSelect || this.props.onSelect(character);
		this.setState({
			selected: isSelect ? character: null
		});
	}

	render() {
		return template.call(this);
	}
}
