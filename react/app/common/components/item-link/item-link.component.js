import React from 'react';
import { Service } from '~/api/engine';
import { UISref } from '@uirouter/react';

export class ILink extends React.Component {
    render() {
        const { item } = this.props;
        const { __service: service } = item;
        if (service) {
            const { model } = service;
            let { route, config, modelName } = model;
            if (!modelName) modelName = `${config.name.toLowerCase()}Id`;
            if (route) {
                const params = { [modelName]: this.props.item.__id };
                return <UISref to={route} params={params}><a>{ this.props.children }</a></UISref>;
            }
        }
        return <span>{ this.props.children }</span>
    }
}