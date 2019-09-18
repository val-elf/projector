import React from "react";
import PropTypes from "prop-types";
import template from "./icon-preview.template";
import './icon-preview.component.less';
import { WellKnownTypes } from './well-known-types';

export class IconPreview extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	};

	state = {
		highlighted: true,
		loaded: false
	};

	hostRef = React.createRef();
	get host() {
		return this.hostRef.current;
	}

	static getDerivedStateFromProps(props, state) {
		const { item, image, defaultIcon, previewUrl, expanded, type, loading, progress } = props;
		let { highlighted } = props;
		if (highlighted === undefined) highlighted = state.highlighted;

		const newState = Object.assign({}, state);
		Object.assign(newState, {
			iconType: type,
			item,
			defaultIcon,
			previewUrl,
			image,
			expanded,
			highlighted,
			loading,
			progress
		});
		IconPreview.defineInnerProperties(props, newState);
		return newState;
	}

	static defineInnerProperties(props, state) {
		const { item, image } = state;
		if (!item) {
			Object.assign(state, { defaultIcon: 'unknown' });
			return;
		}
		let { previewUrl } = state;
		let { defaultIcon } = state;
		let width; let height; let hash;
		const preview = image ? image : (item ? item.preview : null);
		const { type } = item;
		if (preview) hash = preview.hash;

		if (preview) {
			width = preview.width;
			height = preview.height;
		}

		if (!defaultIcon) defaultIcon = IconPreview.detectIconType(item);

		if (preview) {
			previewUrl = previewUrl || (props.item ? `${props.item.previewUrl}?${hash || ''}` : undefined);
		}

		Object.assign(state, {
			preview,
			type,
			previewUrl,
			defaultIcon,
			width,
			height
		});
	}

	static detectIconType(item){
		const { type, subtype } = item;
		if (WellKnownTypes[type]) return WellKnownTypes[type];
		if (subtype && WellKnownTypes[subtype]) return subtype;
		switch(type){
			case 'application':
				switch(subtype){
					case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
						return 'document';
					break;
				}
			break;
			case 'base64':
				return 'document';
			case 'locations':
				return 'locations ' + item.locationType;
			default:
				return item.coretype;
		}
	}

	iconEnter() {
		const isExpanded = this.state.item && !!this.previewImage;
		const rheight = this.height;
		this.setState({ isExpanded });
		const diff = rheight - this.height;
		this.setState({ expandedMargin: diff });
	}

	iconLeave() {
		this.setState({ isExpanded: false, expandedMargin: 0 });
	}


	get aspectHeight() {
		const { width, height } = this.props;
		const { height: rheight, width: rwidth, expanded } = this.state;
		if (!expanded) {
			if (height) return height;
			if (!rheight) return width;
		}
		return Math.round(rheight * this.width / rwidth);
	}

	get preview64() {
		const { preview } = this.state;
		if (preview && preview.preview) return preview.preview;
	}

	get isContained() {
		return !!this.props.height && this.props.type !== 'circle';
	}

	// state.width and state.height - is real image width and heights

	get _height() { // height defined by component's settings
		if (this.props.height !== undefined) return this.props.height;
		return this.width;
	}

	get _width() { // width defined by component's settings
		const { width } = this.props;
		if (width) return width;
		return this.state.width;
	}

	get height() {
		const { isExpanded, expanded } = this.state;
		if (!expanded) {
			return this.aspectHeight;
		}
		if (!isExpanded) return this._height;
		return this.aspectHeight;
	}

	get width() {
		const { expanded } = this.state;
		const { width } = this.props;
		const { width: realWidth } = this.state;
		if (expanded) {
			return this._width;
		}
		if (width && realWidth && width < realWidth) return width;
		if (realWidth) return realWidth;
		if (width) return width;
		if (this.item && this.item.preview) return this.item.preview.width;
	}

	get containerWidth() {
		return this.width;
	}

	get containerHeight() {
		const { expanded, isExpanded, height, width } = this.state;
		if (!expanded) return this.height;
		if (height > width) {
			return this.aspectHeight;
		}
		if (expanded) {
			if (!isExpanded) return this.width;
			return this.aspectHeight;
		}
		return this.height;
	}

	get previewImage() {
		if (this.state.faultPreview) return;
		return this.preview64 ? `data:${this.type};base64,${this.preview64}` : this.state.previewUrl
	}

	get item() {
		return this.state.item;
	}

	get image() {
		return this.state.image;
	}

	constructor(props){
		super(props);
		this.defaultIcon = this.props.defaultIcon;
	}

	componentDidMount() {
		this.setupNodesBehavior();
	}

	setupNodesBehavior() {
		if (this.state.expanded) {
			this.host.addEventListener('mouseenter', (evt) => this.iconEnter(evt));
			this.host.addEventListener('mouseleave', (evt) => this.iconLeave(evt));
		}


		this.fileInfo = this.host.querySelector('.file-info') || null;
		const { item } = this.state;
		if (!item) return;

		if (!this.state.item.preview && this.state.previewUrl) {
			const measurer = new Image();
			measurer.src = this.state.previewUrl;
			this.setState({ loaded: true });
			measurer.addEventListener('load', () => {
				const { width, height } = measurer;
				this.setState({ width, height, loaded: false });
			});
			measurer.addEventListener('error', () => {
				this.setState({ faultPreview: true, loaded: false });
			})
		}

	}

	render(){
		return template.call(this);
	}
}
