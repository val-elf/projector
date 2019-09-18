import React from 'react';
import template from './artifact-characters-details.template';
import { InvoledCharacter } from 'projector/api/models';

export class ArtifactCharactersDetails extends React.Component {
    static getDerivedStateFromProps(props, state) {
        const { involve } = props;
        Object.assign(state, {
            involve,
            role: state.role || involve.role,
            description: state.description || involve.description
        });
        return state;
    }

    get modal() {
        return this.props.modal;
    }

    state = { };

    get involve() {
        return this.props.involve;
    }

    componentDidMount() {
        this.modal.onClose(result => {
            if (result) {
                const { role, description } = this.state;
                Object.assign(this.involve, { role, description });
            }
        });
    }

    update(field) {
        return evt => {
            this.setState({ [field]: evt.target.value });
        }
    }

    render() {
        return template.call(this);
    }
}