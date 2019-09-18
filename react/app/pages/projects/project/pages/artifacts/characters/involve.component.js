import React from 'react';
import PropTypes from 'prop-types';
import template from './involve.template.rt';

export class Involve extends React.Component {

    static getDerivedStateFromProps(props, state) {
        return {
            char: props.item.character
        }
    }

    static constextTypes = {
        t: PropTypes.func.isRequired
    }

    state = {};

    openDetails() {
        if (this.props.onOpenDetails) this.props.onOpenDetails(this.props.item);
    }

    removeInvolved() {
        if (this.props.onRemove) this.props.onRemove(this.props.item);
    }

    render() {
        return template.call(this);
    }
}