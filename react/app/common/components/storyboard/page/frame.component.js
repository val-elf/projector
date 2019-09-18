import React from 'react';
import PropTypes from 'prop-types';
import template from './frame.template';
import './frame.component.less';

export class Frame extends React.Component {
    static contextTypes = {
        t: PropTypes.func.isRequired,
        table: PropTypes.object.isRequired
    };

    static getDerivedStateFromProps(props, state) {
        const newState = Object.assign({}, state);
        const { frame, selected } = props;
        if (newState.frame !== frame) newState.frame = frame;
        if (selected !== newState.initSelected) {
            newState.initSelected = selected;
            newState.selected = selected;
        }
        return newState;
    }

    state = {};
    frameRef = React.createRef();
    movable = false;

    get frame() { return this.frameRef.current; }
    get distance() { return this.props.distance; }
    get padding() { return this.distance - 1; }
    get table() { return this.context.table; }

    _distance(p1) {
        return p1.x * p1.x + p1.y * p1.y;
    }

    /* event handlers */
    move = async evt => {
        const { frame } = this.state;
        const delta = { x: evt.pageX - this.ancor.x, y: evt.pageY - this.ancor.y };
        if (!this.movable && this._distance(delta) < 5) return;
        this.movable = true;
        Object.assign(this.ancor, { x: evt.pageX, y: evt.pageY });
        frame.left += delta.x;
        frame.top += delta.y;
        if (this.props.onMove) await this.props.onMove();
        else this.setState({ frame });
    }

    mousedown = evt => {
        const { selected } = this.state;
        if (!selected) return;
        this.movable = false;
        this.ancor = { x: evt.pageX, y: evt.pageY };
        document.addEventListener('mousemove', this.move);
        document.addEventListener('mouseup', this.mouseup);
    }

    mouseup = evt => {
        evt.stopPropagation();
        document.removeEventListener('mousemove', this.move);
        document.removeEventListener('mouseup', this.mouseup);
        this.movable = false;
    }

    focus = evt => this.select(evt);

    clicker = evt => this.select(evt);

    keyProcess = async evt => {
        evt.preventDefault();
        const { frame } = this.state;
        switch(evt.code) {
            case 'PageUp':
                await this.table.moveUp(frame);
                this.setState({ frame });
            break;
            case 'PageDown':
                this.table.moveDown(frame);
            break;
        }
    };

    componentDidMount() {
        this.frame.addEventListener('focus', this.focus);
        //this.frame.addEventListener('click', this.clicker);
        this.frame.addEventListener('mousedown', this.mousedown);
        this.frame.addEventListener('keyup', this.keyProcess);
    }

    componentDidUpdate() {
        if (this.state.selected) this.frame.focus();
    }

    componentWillUnmount() {
        if (this.frame) {
            this.frame.removeEventListener('focus', this.focus);
            //this.frame.removeEventListener('click', this.clicker);
            this.frame.removeEventListener('mousedown', this.mousedown);
            this.frame.removeEventListener('keyup', this.keyProcess);
        }
    }

    select(evt) {
        evt.stopPropagation();
        if (this.movable) return;
        if (this.props.onSelect) this.props.onSelect();
    }

    async setEditMode() {
		const res = await this.table.edit(this.state.frame);
		this.setState({ background: res.src });
    }

    render() {
        return template.call(this);
    }
}