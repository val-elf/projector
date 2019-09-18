import React from 'react';
import PropTypes from 'prop-types';
import { ModalService } from 'common/materials';
import { NewStoryPage } from './modals/new-story-page.component';
import { pages, selected } from './mocks';
import template from './storyboard.template';

export class Storyboard extends React.Component {
    static contextTypes = {
        t: PropTypes.func.isRequired
    }

    get newDefaultPageName() {
        const pageName = this.context.t('APP_STORYBOARD_DEFAULT_PAGE');
        const { pages } = this.state;
        const pcount = pages.reduce((res, pg) => {
            const mtc = pg.name.match(`${pageName} (\\d+)`);
            if (mtc) {
                const cnt = parseInt(mtc[1], 10);
                if (res < cnt) res = cnt;
            }
            return res;
        }, 0);
        return `${pageName} ${pcount + 1}`;
    }

    static getDerivedStateFromProps(props, state) {
        const newState = Object.assign({}, state);
        const { owner } = props;
        if (newState.owner !== owner) newState.owner = owner;
        return newState;
    }

    state = {
        selected,
        pages
    };

    selectPage(page) {
        this.setState({ selected: page });
    }

    async addNewPage() {
        try {
            const newStoryPage = await ModalService.open(NewStoryPage, {
                title: this.context.t('APP_STORYBOARD_ADD_PAGE'),
                content: {
                    defaultName: this.newDefaultPageName
                }
            });
            await newStoryPage.save();
            const { pages } = this.state;
            pages.push(newStoryPage);

            this.setState({ storyPage: newStoryPage, pages });
        } finally { }
    }

    render() {
        return template.call(this);
    }
}