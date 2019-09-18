import React from 'react';
import { HSV2RGB, RGB2hex } from './colors';
import template from './saturation-selector.template.rt';
import { clearSelection } from '../../utils';

export class SaturationSelector extends React.Component {
    state = {
        hue: 0,
        saturation: 0,
        value: 0
    };

    static getDerivedStateFromProps(props, state) {
        const newState = Object.assign({}, state);
        const { hsv, width, thickness } = props;
        if (newState.hsv !== hsv) {
            newState.hsv = hsv;
            Object.assign(newState, hsv);
        }
        if (newState.width !== width) newState.width = width;
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
        const { width } = this.state;
        const { left } = this.marker.getBoundingClientRect();
        let saturation = (evt.pageX - left) / width;
        if (saturation > 1) saturation = 1;
        if (saturation < 0) saturation = 0;
        this.setState({ saturation });
        this.ancor = { left };
    }

    pointermove = evt => {
        clearSelection();
        const { width } = this.state;
        let saturation = (evt.pageX - this.ancor.left) / width;
        if (saturation > 1) saturation = 1;
        if (saturation < 0) saturation = 0;
        this.setState({ saturation });
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
        if (pstate.saturation !== saturation && pstate.hsv === hsv) {
            if (this.props.onChange) this.state.hsv = this.props.onChange({ hue, saturation, value });
        }
    }

    componentWillUnmount() {
        this.marker.removeEventListener('pointerdown', this.pointerdown);
    }

    render() {
        return template.call(this);
    }
}