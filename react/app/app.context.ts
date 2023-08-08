import * as React from 'react';
import * as PropTypes from 'prop-types';

export const AppContext = React.createContext({
    project: null,
    setProject: (project) => this?.project = project
});