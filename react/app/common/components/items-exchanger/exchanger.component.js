import React from 'react';
import { ExchangerPanel } from './exchanger-panel.component';
import { decompositeChildren } from '~/common/utils';
import template from './exchanger.template';

export class Exchanger extends React.Component {
    state = {
        panels: []
    };

    panelIsntances = {};

    static getDerivedStateFromProps(props, state) {
        const children = decompositeChildren(props.children);
        const panels = children.filter(child => child.type === ExchangerPanel);
        state.panels = panels;
        return state;
    }

    componentDidMount() {
        this.cont = document.createElement('div');
        this.cont.classList.add('brick', 'list', 'flyout', 'shade', 'hovered');
        document.body.appendChild(this.cont);
    }

    componentWillUnmount() {
        document.body.removeChild(this.cont);
    }

    getFlyoutContainer() {
        return this.cont;
    }

    registryPanel(panelInstance) {
        this.panelIsntances[panelInstance.name] = panelInstance;
    }

    getPanel(name) {
        return this.panelIsntances[name];
    }

    render() {
        this.state.panels.forEach(panel => {
            panel.props.exchanger = this;
            panel.props.hasRef = !!panel.ref;
        });
        return template.call(this);
    }
}