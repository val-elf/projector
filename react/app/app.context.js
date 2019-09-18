import React from 'react';
import PropTypes from 'prop-types';

export const AppContext = React.createContext({
    project: null,
    setProject: (project) => this.project = project
});