import React from 'react';
import { IconPreview } from 'common/icon-preview';
import template from './artifact-characters.template';
import { Involvement } from '~/api/models';
import './artifact-characters.component.less';

export class ArtifactCharacters extends React.Component {
    constructor(props) {
        super(...arguments);
    }

    state = {
        characters: [],
        involves: []
    };
    _characters = [];
    involvedRef = React.createRef();

    async componentDidMount() {
        let involves = this.artifact.characters;
        this._characters = [...await this.artifact.project.characters.getList()];
        await Promise.all(involves.map(async inv => await inv.character));
        involves = involves.filter(inv => inv && inv.character);
        this.artifact.characters = involves;
        this.setState({ involves, characters: this.characters });
    }

    get artifact() {
        return this.props.artifact;
    }

    get characters() {
        const { characters: involves } = this.artifact;
        return this._characters.filter(char => !involves.find(inv => inv.get('_character') === char.id));
    }

    applyCharacters(charactersList) {
        this.charactersList = charactersList;
    }

    getCharacterPosition(involve) {
        const { characters: involves } = this.artifact;
        const icharacters = involves.map(inv => inv.character);
        const rindex = this._characters.findIndex(char => char.id === involve.character.id);
        let result = 0;
        this._characters.some((char, index) => {
            if (index > rindex) return true;
            if (!icharacters.find(ichar => ichar.id === char.id)) result ++;
            return false;
        });
        return result;
    }

    async addInvolvement(character) {
        const { characters: involves } = this.artifact;
        const { characters } = this;
        const involvement = Involvement.create({ character });
        const index = characters.indexOf(character);
        characters.splice(index, 1);
        involves.unshift(involvement);
        this.setState({ involves, characters });
        this.artifact.save();
    }

    async removeInvolved(involve) {
        await this.involvedRef.current.exchange(involve);
        const { characters: involves } = this.artifact;
        const index = involves.indexOf(involve);
        if (index > -1) {
            involves.splice(index, 1);
            const characters = this.characters;
            this.setState({ involves, characters });
            this.artifact.save();
        }
    }

    changeInvolveOrder(oldIndex, newIndex) {
        if (oldIndex === newIndex) return;
        const { characters: involves } = this.artifact;
        const movedItem = involves[oldIndex];
        involves.splice(oldIndex, 1);
        involves.splice(newIndex, 0, movedItem);
        this.setState({ involves });
        this.artifact.save();
    }

    getInvolvedTitle(props) {
        if (!props) return;
        const { character } = props.involve;
        return (<React.Fragment><IconPreview item={character} type="circle" width="55" height="55"/> {character.name}</React.Fragment>);
    }

    async openDetails(involve) {
        const confirm = await this.editor.open(true, { involve });
        if (confirm) {
            this.artifact.save();
            this.setState({ involves: this.artifact.characters });
        }
    }

    render() {
        return template.call(this);
    }
}