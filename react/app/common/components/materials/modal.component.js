import React from "react";
import PropTypes from "prop-types";
import template from "./modal.template.rt";
import alertTemplate from "./modal-alert.template.rt";
import { Button } from "@material-ui/core";
import './modal.component.less';

export class Modal extends React.Component{

	static contextTypes = {
		t: PropTypes.func.isRequired
	};

	static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		let { onHide, footer, showFooter, mode, title, className, minWidth } = props;
		if (showFooter === undefined) showFooter = true;
		const init = state.init || {};
		if (init.title !== title) newState.title = title;
		if (init.onHide !== onHide) newState.onHide = onHide;
		if (init.mode !== mode) newState.mode = mode;
		if (init.footer !== footer) newState.footer = footer;
		if (init.showFooter !== showFooter) newState.showFooter = showFooter;
		Object.assign(newState, {
			init: {
				mode,
				title,
				onHide,
				footer,
				showFooter,
				className,
				minWidth
			}
		});
		return newState;
	}

	state = {
		isShow: false,
		showFooter: true
	};

	componentDidUpdate(prevProps, prevState) {
		const { onHide, isShow, apply, data } = this.state;
		if (prevState.isShow && !isShow) {
			onHide && onHide(apply ? data || apply : apply);
			if (apply)
				this.resolve && this.resolve(data !== undefined ? data : apply);
			else
				this.reject && this.reject(data);
		}
	}

	isDisabled(){
		return false;
	}

	get title() {
		const { title } = this.state;
		if (typeof(title) === 'string') return title;
		if (typeof(title) === 'object') {
			const { propName, defaultValue } = title;
			if (propName && this.currentContent) {
				const path = propName.split('.');
				let value = this.currentContent;
				while(path.length) {
					const key = path.shift();
					let _value = value[key];
					if (typeof(_value) === 'string') return _value;
					value = _value;
				}
				return value || defaultValue;
			}
			return defaultValue;
		}
		if (typeof(title) === 'function') return title(this.currentContent);
		return '';
	}

	open(visible = true, content, options){
		this.showOptions = Object.assign({ }, options);
		this.currentContent = Object.assign({ modal: this }, content);
		this.setState({ isShow: visible, content: this.currentContent, data: {} });

		return new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}

	openComponent(options, component) {
		this.showOptions = {};
		let { title, mode } = this.state;
		let { className, minWidth } = this.state;
		let { showFooter } = options;
		/* map options to state */
		if (showFooter === undefined) showFooter = true;
		if (options.className) className = options.className;
		if (options.minWidth !== undefined) minWidth = options.minWidth;
		if (options.alert) mode = 'alert'; else mode = '';
		if (options.title) title = options.title;

		this.currentContent = Object.assign({ modal: this }, options.content);
		this.component = component;
		this.setState({
			isShow: true,
			content: this.currentContent,
			title,
			showFooter,
			className,
			minWidth: minWidth,
			mode,
			data: {}
		});

		return new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}

	close(actionType){
		let { data } = this.state;
		const controller = this.ref && this.ref.current;
		const done = () => {
			if (controller && controller.onClose) {
				const result = controller.onClose(actionType, data);
				if (result !== undefined) data = result;
			}
			if (this._closeCallback) this._closeCallback(actionType);
			this.setState({
				isShow: false,
				apply: actionType,
				data: data
			});
		}

		if (this.showOptions.beforeClose) {
			Promise.resolve(this.showOptions.beforeClose(actionType, data))
				.then(() => done());
		} else
			done();
	}

	onClose(cb) {
		this._closeCallback = cb;
	}

	convertChild(child) {
		return React.cloneElement(child, this.state.content);
	}

	get children() {
		if (this.component) {
			const isComponent = React.Component.isPrototypeOf(this.component);
			this.ref = isComponent ? React.createRef() : null;
			const element = React.createElement(this.component, {
				...this.state.content,
				modal: this,
				ref: this.ref
			});
			return element;
		}
		return React.Children.map(this.props.children, child => this.convertChild(child));
	}

	get defaultFooter() {
		return (
			<span>
				<span className="brick mrm">
					<Button onClick={()=>this.close(false)}>{ this.context.t('APP_CANCEL') }</Button>
				</span>
				<span className="brick">
					<Button variant="raised" className="btn btn-primary" onClick={() => this.close(true)} disabled={this.isDisabled()}>{ this.context.t('APP_SAVE') }</Button>
				</span>
			</span>
		);
	}

	render(){
		return this.state.mode !== 'alert' ? template.call(this) : alertTemplate.call(this);
	}
}
