import React from "react";
import template from "./checkbox.template"
import { Checkbox as ICheckbox } from "@material-ui/core";

export class Checkbox extends React.Component {
  state = {};

  static getDerivedStateFromProps(props) {
    return {
      checked: props.checked
    }
  }

  get checkboxControl() {
    return (<ICheckbox checked={this.state.checked} onChange={(event) => this.toggleCheckbox(event)} color="primary" disabled={this.props.disabled} />)
  }

  toggleCheckbox(event) {
    this.props.onChange && this.props.onChange(event.target.checked);
    this.setState({
      checked: event.target.checked
    });
  }

  render() {
    return template.call(this);
  }
}