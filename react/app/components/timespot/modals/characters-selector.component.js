import React from 'react';
import PropTypes from 'prop-types';
import template from './characters-selector.template';

export class CharactersSelector extends React.Component {
    static contextTypes = {
        t: PropTypes.func.isRequired
    }

    state = {
        selected: {}
    };

    static getDerivedStateFromProps(props, state) {
        const { characters, project } = props;
        const newState = Object.assign({}, state);
        if (state.characters !== characters) Object.assign(newState, { characters });
        if (state.project !== project) Object.assign(newState, { project });
        newState.selected = props.selected;
        return newState;
    }

    async componentDidMount() {
        const { characters } = this.state;
        const pcharacters = await this.state.project.characters.getList();
        const allCharacters = pcharacters.filter(char => !characters.find(inv => inv.character.id === char.id));
        this.setState({ allCharacters });
    }

    selectCharacter(character) {
        const { selected } = this.state;
        if (selected[character.id]) delete selected[character.id];
        else selected[character.id] = character;
        this.setState({ selected });
    }

    render() {
        return template.call(this);
    }
}