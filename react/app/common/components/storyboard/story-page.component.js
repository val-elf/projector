import React from 'react';
import PropTypes from 'prop-types';
import template from './story-page.template';
import './story-page.component.less';

export class StoryPage extends React.Component {
    static contextTypes = {
        t: PropTypes.func.isRequired
    }

    static getDerivedStateFromProps(props, state) {
        const newState = Object.assign({}, state);
        const { page } = props;
        if (newState.page !== page) newState.page = page;
        return newState;
    }

    state = {};

    get distance() {
        return this.props.distance || 10;
    }

    render() {
        return template.call(this);
    }
}