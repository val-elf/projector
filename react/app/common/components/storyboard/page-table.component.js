import React from 'react';
import PropTypes from 'prop-types';
import { Rectangulars } from './utils';
import template from './page-table.template';
import './page-table.component.less';

export class PageTable extends React.Component {
    static contextTypes = {
        t: PropTypes.func.isRequired
    }

    static childContextTypes = {
        table: PropTypes.object.isRequired
    }

    static getDerivedStateFromProps(props, state) {
        const newState = Object.assign({}, state);
        const { page, distance } = props;
        if (page !== newState.page) {
            newState.page = page;
            newState.frames = page.frames;
            Rectangulars.detectIntersects(page.frames, distance);
        }
        return newState;
    }

    getChildContext() {
        return { table: this };
    }

    state = {};
    editorRef = React.createRef();
    get editor() { return this.editorRef.current; }

    get distance() {
        return this.props.distance;
    }

    clearSelected() {
        if (this.editor.state.active) return;
        this.setState({ selected: null });
    }

    selectFrame(frame) {
        this.setState({ selected: frame });
    }

    async edit(frame) {
		const { image } = await this.editor.edit(frame);
		return image;
    }

    async moveUp(frame) {
        const { frames } = this.state;
        const ind = frames.indexOf(frame);
        if (ind > -1) {
            const frm = frames.splice(ind, 1);
            frames.splice(ind + 1, 0, frm[0]);
            await this.recalculate();
        }
    }

    async moveDown(frame) {
        const { frames } = this.state;
        const ind = frames.indexOf(frame);
        if (ind > 0) {
            frames.splice(ind, 1);
            frames.splice(ind - 1, 0, frame);
            await this.recalculate();
        }
    }

    async recalculate() {
        const { frames } = this.state;
        Rectangulars.detectIntersects(frames, this.distance);
        await this.setState({ frames });
    }

    render() {
        return template.call(this);
    }
}