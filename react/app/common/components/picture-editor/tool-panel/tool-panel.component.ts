import * as React from 'react';
import template from './tool-panel.template.rt';
import { clearSelection } from '~/common/utils';
import './tool-panel.component.less';

interface ToolPanelProps {
	title: string;
}

interface ToolPanelState {
	showed: boolean;
	location: { x: number, y: number }
}

export class ToolPanel extends React.Component<ToolPanelProps, ToolPanelState> {
	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { showed } = props;
		if (newState.showed !== showed) newState.showed = showed;
		return newState;
	}

	state = { showed: false, location: { x: 0, y: 0 } };
	ancor: { x: number, y: number };

	rootRef = React.createRef();
	get root() { return this.rootRef.current as HTMLElement; }
	get title() { return this.props.title; }

	componentDidMount() {
		document.body.appendChild(this.root);
		const { location } = this.state;
		Object.assign(this.root.style, {
			left: `${location.x}px`,
			top: `${location.y}px`
		});
	}

	componentWillUnmount() {
		document.body.removeChild(this.root);
	}

	componentDidUpdate(pprops, pstate) {
		const { showed } = this.state;
		if (pstate.showed !== showed) {
			if (showed) {
				const header = this.root.querySelector('.picture-editor_panel-head');
				header.addEventListener('mousedown', this.startMove);
				header.addEventListener('touchstart', this.startMove);
			}
		}
	}

	startMove = evt => {
		document.addEventListener('mousemove', this.move);
		document.addEventListener('mouseup', this.endMove);
		document.addEventListener('touchmove', this.move);
		document.addEventListener('touchend', this.endMove);
		if (evt.type === 'touchstart') {
			const tch = evt.touches[0];
			this.ancor = { x: tch.pageX, y: tch.pageY };
		}
	}

	move = evt => {
		clearSelection();
		const { location } = this.state;
		let { movementX, movementY } = evt;
		if (evt.type === 'touchmove') {
			const tch = evt.touches[0];
			movementX = tch.pageX - this.ancor.x;
			movementY = tch.pageY - this.ancor.y;
			Object.assign(this.ancor, { x: tch.pageX, y: tch.pageY });
		}
		location.x += movementX;
		location.y += movementY;
		Object.assign(this.root.style, {
			left: `${location.x}px`,
			top: `${location.y}px`
		})
	}

	endMove = evt => {
		document.removeEventListener('mousemove', this.move);
		document.removeEventListener('mouseup', this.endMove);
		document.removeEventListener('touchmove', this.move);
		document.removeEventListener('touchend', this.endMove);
	}

	render() {
		return template.call(this);
	}
}