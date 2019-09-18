import React from 'react';
import PropTypes from 'prop-types';
import template from './create-tool-properties.template.rt';

export class CreateToolProperties extends React.Component {
    static contextTypes = {
        t: PropTypes.func.isRequired
    }

    render() {
        return template.call(this);
    }
}