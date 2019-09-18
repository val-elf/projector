import React from 'react';
import PropTypes from 'prop-types';
import template from './timespot-card.template.rt';

export class TimespotCard extends React.Component {
    static contextTypes = {
        t: PropTypes.func.isRequired
    };

    state = {};

    constructor(props, context) {
        super(props, context);
    }

    static getDerivedStateFromProps(props, state) {
        const { timespot } = props;
        const newState = Object.assign({}, state);
        if (newState.wspot !== timespot) {
            const clone = timespot.plain();
            newState.timespot = clone;
            clone.startDate = timespot.startDate;
            clone.endDate = timespot.endDate;
            newState.wspot = timespot;
        }
        return newState;
    }

    setTimespotName(value) {
        const { timespot } = this.state;
        timespot.title = value;
        this.setState({ timespot });
    }

    changeStartDate(value) {
        const { timespot } = this.state;
        timespot.startDate = value.toDate();
        this.setState({ timespot });
    }

    changeEndDate(value) {
        const { timespot } = this.state;
        timespot.endDate = value.toDate();
        this.setState({ timespot });
    }

    onClose(type, data) {
        if (type) {
            Object.assign(data, this.state.timespot);
        }
    }

    render() {
        return template.call(this);
    }
}