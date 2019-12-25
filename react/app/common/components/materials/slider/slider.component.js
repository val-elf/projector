import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './slider.styles';
import { clearSelection } from '~/common/utils';
import template from './slider.template';

class SliderComponent extends React.Component {
    static getDerivedStateFromProps(props, state) {
        const newState = Object.assign({}, state);
        const { value, label, min, max, step, width } = props;
        if (newState.extValue !== value) {
            newState.value = Number(value);
            newState.extValue = value;
        }
        if (newState.label !== label) newState.label = label;
        if (min !== undefined && newState.min !== Number(min)) newState.min = Number(min);
        if (max !== undefined  && newState.max !== Number(max)) newState.max = Number(max);
        if (step !== undefined  && newState.step !== Number(step)) newState.step = Number(step);
        if (width !== undefined && newState.width !== width) newState.width = width;
        return newState;
    }

    state = {
        min: 0,
        max: 1,
        step: 0.01,
        width: 200
    }

    get theme() { return this.props.theme; }

    rootRef = React.createRef();
    get root() { return this.rootRef.current; }
    get location() {
        const { value, min, max, step } = this.state;
        let res = (value - min) / (max - min);
        res = Math.round(res * 10000) / 100;
        return res;
    }

    set location(loc) {
        const { min, max } = this.state;
        let value = min + (loc / 100) * (max - min);
        this.setState({ value });
    }

    startDrag = evt => {
        document.addEventListener('pointermove', this.drag);
        document.addEventListener('pointerup', this.endDrag);
        const { width, x } = this.root.getBoundingClientRect();
        this.ancor = { x, width };
    }

    drag = evt => {
        clearSelection();
        let { drag } = this.state;
        const { pageX: x } = evt;
        const { width, x: ancor } = this.ancor;
        let value = (x - ancor) / width;
        if (value < 0) value = 0;
        if (value > 1) value = 1;
        this.location = value * 100;
        if (!drag) this.setState({ drag: true });
    }

    endDrag = async evt => {
        document.removeEventListener('pointermove', this.drag);
        document.removeEventListener('pointerup', this.endDrag);
        await this.setState({ drag: false });
        const { pageX: x } = evt;
        const { width, x: ancor } = this.ancor;
        let value = (x - ancor) / width;
        if (value < 0) value = 0;
        if (value > 1) value = 1;
        this.location = value * 100;
    }

    componentDidUpdate(pprops, pstate) {
        const { value } = this.state;
        if (value !== pstate.value && this.props.onChange) this.props.onChange(value);
    }

    componentDidMount() {
        this.root.addEventListener('pointerdown', this.startDrag);
    }

    render() {
        return template.call(this);
    }
}

export const Slider = withStyles(styles)(SliderComponent);