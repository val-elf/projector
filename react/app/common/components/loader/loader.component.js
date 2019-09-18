import React from "react";
import template from './loader.template.rt';
import './loader.component.less';


export class Loader extends React.Component {

	rotorRef = React.createRef();
	get rotor() { return this.rotorRef.current; }
	get host() { return this.rotor.parentNode; }
	degree = 0;
	state = {
		load: false,
		active: false
	};

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { load, progress } = props;
		if (load !== state.load) {
			newState.load = load;
			newState.active = load;
		}
		newState.progress = progress;
		return newState;
	}

	render(){
		return template.call(this);
	}
}
