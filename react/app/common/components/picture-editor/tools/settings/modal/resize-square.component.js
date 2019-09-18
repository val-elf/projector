import React from 'react';
import template from './resize-square.template';
import './resize-square.component.less';

export class ResizeSquare extends React.Component {

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { expandWidth, expandHeight } = props;
		if (newState.expandWidth !== expandWidth) newState.expandWidth = expandWidth;
		if (newState.expandHeight !== expandHeight) newState.expandHeight = expandHeight;
		return newState;
	}

	state = {
		square: 4,
		marked: {}
	}

	squareRef = React.createRef();
	get square() { return this.squareRef.current; }
	squares = [0, 1, 2, 3, 4, 5, 6, 7, 8];

	selectSquare(square) {
		this.setState({ square });
		this.fillArrows(square);
	}

	componentDidMount() {
		this.fillArrows(this.state.square);
	}

	componentDidUpdate(pprops, pstate) {
		const { expandWidth, expandHeight } = this.state;
		if (pstate.expandWidth !== expandWidth || pstate.expandHeight !== expandHeight) {
			this.fillArrows(this.state.square);
		}
	}

	fillArrows(square) {
		const { expandWidth, expandHeight } = this.props;
		const xs = square % 3;
		const ys = (square - xs) / 3;
		const marked = {};
		for (let index = 0; index < 9; index ++) {
			if (index === square) continue;
			let x = index % 3;
			const y = (index - x) / 3 + (1 - ys);
			x += 1 - xs;
			if (x < 0 || y < 0 || x > 2 || y > 2) continue;
			const indexies = [
				y !== 1 ? expandHeight ^ y > 1 ? 'up' : 'down' : null,
				x !== 1 ? expandWidth ^ x > 1 ? 'left' : 'right' : null
			].filter(i => i);
			marked[index] = indexies.join('-');
		}
		if (this.props.onChange) this.props.onChange(square);
		this.setState({ marked });
	}

	render() {
		return template.call(this);
	}
}