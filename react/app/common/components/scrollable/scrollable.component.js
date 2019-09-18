import React from "react";
import template from "./scrollable.template";
import { ScrollableEngine } from "./scrollable.engine2";
import './scrollable.component.less';

export class Scrollable extends React.Component {
  engine = {};
	state = {};

  static getDerivedStateFromProps(props) {
    return {
      orientation: props.orientation || 'vertical'
    }
  }

  componentDidMount() {
    this.engine = new ScrollableEngine(this, this.root, this.state.orientation);
    this.engine.on('onReachEnd', evt => this.reachEnd(evt));
    // initial reach event fire
    this.reachEnd({});
  }

  componentWillUnmount() {
    this.engine.destroy();
  }

  reachEnd(evt) {
    this.props.onReachEnd && this.props.onReachEnd(evt);
  }

	render() {
		return template.call(this)
	}
}