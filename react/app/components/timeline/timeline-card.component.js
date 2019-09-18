import React from 'react';
import PropTypes from 'prop-types';
import template from './timeline-card.template';
import moment from 'moment';

export class TimelineCard extends React.Component {
    static contextTypes = {
        t: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        const { timeline } = props;
        if (!timeline.startDate) timeline.startDate = null;
        if (!timeline.endDate) timeline.endDate = null;
        this.state = { timeline };
    }

    handleChange(field) {
        const { timeline } = this.state;
        return evt => {
            if (evt && evt.target) {
                timeline[field] = evt.target.value;
            } else if (['startDate', 'endDate'].indexOf(field) > -1) {
                timeline[field] = evt && evt.toDate() || null;
            }
            this.setState({ timeline });
        }
    }

    render() {
        return template.call(this);
    }
}
