import { Component } from 'react';
import template from './brush-options.template.rt';
import { Brush } from '../../tools';

interface BrushOptionsState {
	tool?: Brush;
	size: number;
	hardness: number;
	flow: number;
	opacity: number;
}

export class BrushOptions<P, S extends BrushOptionsState> extends Component<P, S> {

    static getDerivedStateFromProps(props, state) {
        const newState = Object.assign({}, state);
        const { tool } = props;
        if (newState.tool !== tool) {
            newState.tool = tool;
        }
        return newState;
    }

    state = { } as S;

	get tool() { return this.state.tool; }

	componentDidMount() {
		this.initTool();
	}

	componentDidUpdate(pprops, pstate) {
		const { tool } = this.state;
		if (tool !== pstate.tool) {
			this.initTool();
		}
	}

	componentWillUnmount() {
		const { tool } = this.state;
		// if (tool) tool.off('change', this.freshToolState);
	}

	initTool() {
		const { tool } = this.state;
		// tool.on('change', this.freshToolState);
		this.freshToolState();
	}

	freshToolState = () => {
		const { tool } = this.state;
		const { size, hardness, flow, opacity } = tool;
		this.setState({
			size,
			hardness,
			flow,
			opacity
		});
	}

    setSize(size) {
        size = Math.round(size);
        this.tool.setBrushSize(size);
        this.setState({ size });
    }

    setHardness(hardness) {
        this.tool.setBrushHardness(hardness);
        this.setState({ hardness });
    }

    setFlow(flow) {
        this.tool.setBrushFlow(flow);
        this.setState({ flow });
    }

    setOpacity(opacity) {
        this.tool.setBrushOpacity(opacity);
        this.setState({ opacity });
    }

    render() {
        return template.call(this);
    }
}