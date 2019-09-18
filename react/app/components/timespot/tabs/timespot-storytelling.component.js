import React from 'react';
import PropTypes from 'prop-types';
import template from './timespot-storytelling.template';

export class TimespotStorytelling extends React.Component {
    static contextTypes = {
        t: PropTypes.func.isRequired
    }

    static getDerivedStateFromProps(props, state) {
        const newState = Object.assign({}, state);
        const { spot } = props;
        if (newState.spot !== spot) newState.spot = spot;
        return newState;
    }

    state = {};

    render() {
        return template.call(this);
    }
}