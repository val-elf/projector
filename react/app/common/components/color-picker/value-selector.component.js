import React from 'react';
import { HSV2RGB, RGB2hex } from './colors';
import template from './value-selector.template.rt';
import { clearSelection } from '../../utils';

export class ValueSelector extends React.Component {
    state = {
        hue: 0,
        saturation: 0,
        value: 1,
        hsv: { hue: 0, saturation: 0, value: 1 }
    };

    static getDerivedStateFromProps(props, state) {
        const newState = Object.assign({}, state);
        const { hsv, height, thickness } = props;
        if (newState.hsv !== hsv) {
            newState.hsv = hsv;
            Object.assign(newState, hsv);
        }
        if (newState.height !== height) newState.height = height;
        if (newState.thickness !== thickness) newState.thickness = thickness;
        return newState;

    }

    markerRef = React.createRef();
    get marker() { return this.markerRef.current; }

    getColorFromHSV(hue, saturation, value) {
        return RGB2hex(HSV2RGB(hue, saturation, value));
    }

    pointerdown = evt => {
        if (evt.button !== 0) return;
        document.addEventListener('pointermove', this.pointermove);
        document.addEventListener('pointerup', this.pointerup);
        const { height } = this.state;
        const { top } = this.marker.getBoundingClientRect();
        let value = 1 - (evt.pageY - top) / height;
        if (value > 1) value = 1;
        if (value < 0) value = 0;
        this.setState({ value });
        this.ancor = { top };
    }

    pointermove = evt => {
        clearSelection();
        const { height } = this.state;
        let value = 1 - (evt.pageY - this.ancor.top) / height;
        if (value > 1) value = 1;
        if (value < 0) value = 0;
        this.setState({ value });
    }

    pointerup = evt => {
        document.removeEventListener('pointermove', this.pointermove);
        document.removeEventListener('pointerup', this.pointerup);
    }

    componentDidMount() {
        this.marker.addEventListener('pointerdown', this.pointerdown);
    }

    componentDidUpdate(pprops, pstate) {
        const { hue, saturation, value, hsv } = this.state;
        if (pstate.value !== value && pstate.hsv === hsv) {
            if (this.props.onChange) this.state.hsv = this.props.onChange({ hue, saturation, value});
        }
    }

    componentWillUnmount() {
        this.marker.removeEventListener('pointerdown', this.pointerdown);
    }

    render() {
        return template.call(this);
    }
}