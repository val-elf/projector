import React from 'react';

export class Form extends React.Component{
	constructor(props){
		super(props);
		this.owner = this.props.modelItem;
	}

	changeField(oldChange, model, props) {
		if(model) this.owner[model] = props[0].target.value;
		oldChange && oldChange.apply(undefined, props);
		this.forceUpdate();
	}

	prepareFields(fields){
		var prepareProperty = (property) => {
			var oldChange = property && property.onChange;
			var modelName = property && property.model;
			if(modelName) {
				property.value = this.owner[modelName];
			}
			property.onChange = (...rprops) => {
				this.changeField(oldChange, modelName, rprops);
			}
		}

		return React.Children.map(fields, (item) => {
			if(!item) return;
			var nprops = item.props && Object.assign({}, item.props) || null;

			if(nprops){
				if(['input', 'textarea', 'button', 'select'].includes(item.type))
					prepareProperty(nprops);
				else if(nprops.children)
					nprops.children = this.prepareFields(nprops.children);
			}

			return item.type && React.cloneElement(item, nprops) || item;
		});
	}

	render() {
		var updatedForm = this.prepareFields(this.props.children);
		return (
			<div className={this.props.className}>
				{updatedForm}
			</div>
		);
	}
}