import React from "react";
import PropTypes from "prop-types";
import template from "./project-characters.template.rt";
import { CharacterTypes, CharactersService, ArtifactsService } from "api";

export class ProjectCharacters extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	}

	static getDerivedStateFromProps(props) {
		const { project } = props;
		return {
			project
		}
	}

	state = {};
	async createCharacter() {
		const character = CharactersService.create({}, this.state.project);
		await this.editCharacter(character);
		this.state.characters.flush();
		this.freshList();

	}

	deleteCharacter(character) {
		// TODO create delete character functionality
	}

	switchSortBy(type) {
		let { sort } = this.state;
		sort = sort === type ? null : type;
		this.state.sort = sort;
		this.setState({ groups: [] });
		this.applySort();
	}

	async applySort() {
		const { sort } = this.state;
		const { characters, project } = this.state;
		let groups = [];
		this.setState({ load: true });
		switch(sort) {
			case 'type':
				groups.push(...CharacterTypes.map(ctype => ({
						name: 'APP_CHARACTER_' + ctype,
						characters: characters.filter(char => char.type === ctype)
					})));
				groups.push({
						name: 'Не определены',
						characters: characters.filter(char => !char.type)
					});
			break;
			case 'artifacts':
				const artifacts = await ArtifactsService.getList({ sort: 'name', hasContent: true }, project);
				groups.push(...artifacts.map(art => ({
						name: art.name,
						description: `${this.context.t('APP_ARTIFACT_' + art.type)}${art.subtype ? ', ' + art.subtype: ''}`,
						characters: art.characters.map(inv => Object.assign({
							previewUrl: inv.character.previewUrl
						}, inv.character.plain(), inv.plain()))
					})));
			break;
			default:
				groups.push({ characters });
			break;
		}
		groups = groups.filter(group => group.characters.length);
		this.setState({ sort, groups, load: false });
	}

	async freshList(side) {
		side = side || 'bottom';
		let { characters } = this.state;
		let meta = characters && characters.meta || { page: 0, count: 40, more: true };
		if (side === 'bottom' && meta.more) {
			this.setState({ load: true });
			characters = await CharactersService.getList({ page: meta.page + 1, count: meta.count }, this.state.project);
			this.state.characters = characters;
			await this.applySort();
		}
	}

	async editCharacter(character) {
		await this.characterEditor.open(true, { character });
		character = await character.save();
		const { characters } = this.state;
		this.setState({ characters });
	}

	render() {
		return template.call(this);
	}
}
