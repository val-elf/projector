import React from "react";

export class Tabview extends React.Component {
	render () {
		return <div className="tab-pane active">
			{ this.props.children }
		</div>
	}
}
