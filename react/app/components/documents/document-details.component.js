import React from "react";
import PropTypes from "prop-types";
import template from "./document-details.template.rt";
import './document-details.component.less';

export class DocumentDetails extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	}

	state = { };

	static extractMediaType(mime) {
		if (!mime) return;
		return mime.match(/^(.*?)\//)[1];
	}

	static extractMediaFormat(mime) {
		if (!mime) return;
		return mime.match(/^.*?\/(.*)$/)[1];
	}

	static extractMime(metadata, mime) {
		const mediatype = metadata && metadata.mediatype || DocumentDetails.extractMediaType(mime) || 'unknown';
		const mediaformat = metadata && metadata.subtype || DocumentDetails.extractMediaFormat(mime) || 'unknown';
		return { mediatype, mediaformat };
	}

	static getDerivedStateFromProps(props, pstate) {
		const { document } = props;
		let file;
		let metadata;
		if (document.coretype === 'files') {
			file = document;
			metadata = file.exif;
		} else {
			file = document.file;
			metadata = document.metadata;
		}
		let exif = file ? file.exif : {};
		const { mediatype, mediaformat } = DocumentDetails.extractMime(metadata, file && file.type || exif.mimeType);
		pstate = Object.assign({
			document,
			metadata,
			file,
			documentTitle: document.title || file.name,
			mediatype,
			mediaformat
		}, pstate);
		return pstate;
	}

	onClose(success) {
		if (success) {
			const { documentTitle, document } = this.state;
			if (document.coretype === 'documents') document.title = documentTitle;
			else document.name = documentTitle;
		}
	}

	isDocument(mediaformat) {
		return [
			'vnd.ms-excel',
			'vnd.ms-word',
			'vnd.openxmlformats-officedocument.wordprocessingml.document',
			'vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		].indexOf(mediaformat) > -1;
	}

	handleChanges(type) {
		return (event) => {
			this.setState({
				[type]: event.target.value
			});
		}
	}

	render() {
		return template.call(this);
	}
}