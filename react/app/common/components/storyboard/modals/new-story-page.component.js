import React from 'react';
import PropTypes from 'prop-types';
import template from './new-story-page.template';

export class NewStoryPage extends React.Component {
    static contextTypes = {
        t: PropTypes.func.isRequired
    };

    static getDerivedStateFromProps(props, state) {
        const newState = Object.assign({}, state);
        const { defaultName } = props;
        if (newState.defaultName !== defaultName) {
            newState.defaultName = defaultName;
            newState.pageName = defaultName;
        }
        return newState;
    }

    state = {};

    onClose(apply, data) {
        if (apply) {
            Object.assign(data, {
                name: this.state.pageName,
                save: function() {
                }
            });
        }
    }

    changePageName(value) {
        const pageName = value;
        this.setState({ pageName });
    }

    render() {
        return template.call(this);
    }
}