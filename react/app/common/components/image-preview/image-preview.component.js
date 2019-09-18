import React from 'react';
import PropTypes from 'prop-types';
import template from './image-preview.template';
import './image-preview.component.less';

const wbase = 120;
const multiplyer = 1.1;
const viewport = {
	maxWidth: 600,
	maxHeight: 600,
	width: 600,
	height: 600
};


export class ImagePreview extends React.Component {

    static contextTypes = {
        t: PropTypes.func.isRequired
    }

    static getDerivedStateFromProps(props, state) {
        const newState = Object.assign({}, state);
		const { document } = props;
        if (document !== newState.document) {
            const file = document.coretype !== 'files' ? document.file : document;
            const exif = file && file.exif || {};
            Object.assign(newState, {
                document,
                file,
                exif,
                preview: {
                    zoom: 100,
                    left: '50%',
                    top: '50%',
                    movable: true,
                },
                marker: {
                    left: 10,
                    top: 10,
                    width: 50,
                    height: 50,
                    preview: {
                        width: wbase
                    }
                }
            });
        }
        return newState;
    }

    state = {
		viewport: Object.assign({}, viewport)
    }

	miniPreview = {
		width: 0,
		height: 0,
	};

	mouseMove(evt) {
		evt = evt.nativeEvent || evt;
		const { offsetX: left, offsetY: top } = evt;
		const { preview, viewport } = this.state;
		if(!preview.movable || preview.type === 'contain') return;

		this.updateMarkerPosition({ left, top });

		Object.assign(preview, {
			left: (left / viewport.width * 100) + '%',
			top: (top / viewport.height * 100) + '%'
		});

		this.setState({ preview });
	}

	get width() {
		const { exif, file : { preview } } = this.state;
		return exif ? exif.imageWidth : preview.width;
	}

	get height() {
		const { exif, file : { preview } } = this.state;
		return exif ? exif.imageHeight : preview.height;
    }

    get realZoom() {
        const { viewport } = this.state;
        return this.width / viewport.width * 100;
    }

    get showMiniPreview() {
        return this.state.preview.zoom !== 100;
    }

    zoom(event) {
        event = event.nativeEvent || event;
        if (event.deltaY < 0) this.increaseZoom(1);
        else this.decreaseZoom(1);
        this.updateMarkerPosition({left: event.offsetX, top: event.offsetY });
    }

    increaseZoom(times) {
        const { preview } = this.state;
        preview.zoom *= multiplyer * times;
        if (preview.zoom > this.realZoom) preview.zoom = this.realZoom;
    }

    decreaseZoom(times) {
        const { preview } = this.state;
        preview.zoom /= multiplyer * times;
        if (preview.zoom < 100) preview.zoom = 100;
    }

	updateMarkerPosition(loc) {
		const { left, top } = loc;
		const { marker, viewport, preview } = this.state;
        const rate = wbase / this.width;
        const zoomFactor = preview.zoom / this.realZoom;
		const viewrate = viewport.width / this.width / zoomFactor;

		const previewHeight = this.height * rate;
		const previewWidth = wbase;

		const mwidth = previewWidth * viewrate;
		const mheight = previewHeight * viewrate;

		const mtop = top / viewport.height * (previewHeight - mheight);
		const mleft = left / viewport.width * (previewWidth - mwidth);

		Object.assign(marker, {
			width: mwidth,
			height: mheight,
			top: mtop,
			left: mleft,
			preview: {
				width: previewWidth,
				height: previewHeight
			}
		});

		this.setState({ marker, preview });
	}

    togglePreviewMode(evt) {
		evt = evt.nativeEvent || evt;
		const { offsetX: left, offsetY: top } = evt;
		const { preview, viewport } = this.state;
		if(!preview.movable) return;
		const zoom = preview.zoom === 100 ? this.realZoom : 100;
		const showMiniPreview = zoom !== 100;

		Object.assign(preview, { zoom });

		if(showMiniPreview) {
			this.miniPreview.width = wbase;
			this.miniPreview.height = wbase * this.height / this.width;
		}
		this.updateMarkerPosition({ left, top });
		this.setState({ showMiniPreview, preview, viewport });
	}

	componentDidMount() {
		const { viewport, file } = this.state;
		if (!file) return;
		if (this.width > this.height) {
			viewport.width = this.width > viewport.maxWidth ? viewport.maxWidth : this.width;
			viewport.height = this.height * viewport.width / this.width;
		} else {
			viewport.height = this.height > viewport.maxHeight ? viewport.maxHeight : this.height;
			viewport.width = this.width * viewport.height / this.height;
		}
		this.setState({ viewport });
	}

    render() {
        return template.call(this);
    }
}