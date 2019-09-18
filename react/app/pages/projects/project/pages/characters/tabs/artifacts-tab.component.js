import React from 'react';
import template from './artifacts-tab.template';

export class ArtifactsTab extends React.Component {
    static getDerivedStateFromProps(props, state) {
        const { character } = props;
        return Object.assign({}, state, {
            character
        });
    }

    state = {};

    async componentDidMount() {
        const artifacts = await this.state.character.involvement.getList();
        this.setState({ artifacts });
    }
    render() {
        return template.call(this);
    }
}