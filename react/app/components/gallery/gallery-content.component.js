import React from 'react';
import PropTypes from 'prop-types';
import { FilesService } from 'api';
import { ModalService } from 'common/materials';
import template from './gallery-content.template';
import deleteTemplate from './gallery-content-delete.template';
import './gallery-content.component.less';

export class GalleryContent extends React.Component {
    static contextTypes = {
        t: PropTypes.func.isRequired
    }

    static getDerivedStateFromProps(props, state) {
        const { category, type } = props;
        const newState = Object.assign({}, state);
        if (props.service) newState.service = props.service;

        if (props.count) newState.count = props.count;
        if (state.category !== category) {
            newState.category = category;
        }
        if (type && state.type !== type) {
            newState.type = type;
        }
        return newState;
    }

    state = {
        count: 20,
        type: 'bricks',
        service: FilesService,
        selected: {}
    };

    async loadGallery() {
        const { category, service, count, load } = this.state;
        if (gallery && gallery.parentItem === category && load) return;
        let { gallery } = this.state;
        if (gallery && load) gallery.skip();
        try {
            gallery = service.getList(category);
            gallery.flush();
            const state = { gallery, load: true, selected: {} };
            Object.assign(this.state, state);
            await this.setState(state);
            await gallery.load({ page: 1, count });
            this.setState({ gallery, load: false });
        } catch (error) { }
    }

    componentDidMount() {
        this.loadGallery();
    }

    async refreshGallery() {
        this.loadGallery();
    }

    async componentDidUpdate(pprops, pstate) {
        if (pstate.category !== this.state.category) this.loadGallery(); // select new category
    }

	async readMore() {
        const { gallery } = this.state;
        if (!gallery || gallery.__loading) return;
        let { meta } = gallery;
        if (meta && !meta.more) return;
        if (!meta) meta = { page: 0 };
        await this.setState({ gallery, load: true });
        try {
            await gallery.load({ page: meta.page + 1 });
            this.setState({ gallery });
        } catch (error) {
        } finally {
            this.setState({ load: false });
        }
    }

	refresh() {
		const { gallery } = this.state;
		gallery.flush();
		this.setState({ gallery, selected: {} });
	}

	async selectItem(item, selValue) {
        const { selected } = this.state;
        selected[item.id] = selValue;
        await this.setState({ selected });
	}

	get selectedCount() {
        const { selected } = this.state;
		return Object.keys(this.state.selected).filter(id => selected[id]).length;
	}

	get totalCount() {
		const { gallery } = this.state;
		const { meta } = gallery || { meta: {}};
		return meta && meta.total || 0;
    }

	async deleteSelected() {
        const { selected, gallery } = this.state;
        const docs = gallery.filter(item => selected[item.id]);
        try {
            await ModalService.alert(_ => deleteTemplate.call(docs), {
                title: 'are you sure to delete these file(s)?'
            })
            await Promise.all(docs.map(file => file.delete()));
            this.refresh();
        } catch (error) {
        }
	}

	selectAll(value) {
		let selected = {};
		if (value) {
			selected = this.state.gallery.reduce((res, item) => {
				res[item.id] = true;
				return res;
			}, {});
		}
		this.setState({ selected });
	}

    render() {
        return template.call(this);
    }
}

function DeletedContent(selected) {
    return deleteTemplate.call(selected);
}