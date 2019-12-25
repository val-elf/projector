import React from 'react';
import PropTypes from 'prop-types';
import { CharactersService } from 'api';
import template from './project-link-selector.template.rt';
import { AppContext } from '~/app.context';

export class ProjectLinkSelector extends React.Component {
    static contextTypes = {
        t: PropTypes.func.isRequired
    }


    static getDerivedStateFromProps(props, state) {
        const newState = Object.assign({}, state);
        return newState;
    }

    commonTypes = [
        'timelines',
        'timespots',
        'characters',
        'documents',
        'artifacts',
        'locations',
        'tasks'
    ];

    state = {
        linkType: 'projectItem',
        group: 'characters'
    }

    componentDidMount() {
        this.selectGroup(this.state.group);
    }

    async getCharacters() {
        return CharactersService.getList(this.project).load();
    }

    selectLinkType(linkType) {
        this.setState({ linkType });
    }

    async selectGroup(group) {
        this.setState({ group });
        if (group === 'characters') {
            const characters = await this.getCharacters();
            this.setState({ characters });
        }
    }

    render() {
        return <AppContext.Consumer>
            { ({ project }) => {
                this.project = project;
                return template.call(this);
            } }</AppContext.Consumer>;
    }
}