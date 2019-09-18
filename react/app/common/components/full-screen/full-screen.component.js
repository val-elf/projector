import React from 'react';
import template from './full-screen.template';

export class FullScreen extends React.Component {
    static getDerivedStateFromProps(props, state) {
        const newState = Object.assign({}, state);
        const { expand } = props;
        if (newState._expand !== expand) newState.expand = expand;
        newState._expand = expand;
        return newState;
    }

    state = {};

    componentDidUpdate(pprops, pstate) {
        if (this.state.expand !== pstate.expand) {
            let { expand } = this.state;
            if (expand) {
                document.documentElement.webkitRequestFullScreen();
                document.documentElement.addEventListener('webkitfullscreenchange', async evt => {
                    if (document.webkitIsFullScreen !== expand) {
                        expand = document.webkitIsFullScreen;
                        await this.setState({ expand });
                        if (this.props.onChange) this.props.onChange(expand);
                    }
                });
            } else document.webkitExitFullscreen();
        }
    }

    render() {
        return template.call(this);
    }
}