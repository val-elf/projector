import React from "react";
import PropTypes from "prop-types";
import template from "./file-uploader-window.template";

export class FileUploaderWindow extends React.Component {
	static contextTypes = {
		t: PropTypes.func.isRequired
	};

	state = { files: [] };

	get modal() { return this.props.modal; }
	get loader() { return this.props.loader; }
	get saver() { return this.props.saver; }

	async startUpload() {
		this.props.onStartUpload && await this.props.onStartUpload(this.state.files);
		this.modal.close(true);
	}

	componentDidMount() {
		this.loader.options.onItemLoad = (files, file) => this.onFilePrepared(files, file);
		if (this.saver) {
			const { options } = this.saver;
			const sprogress = options.onProgress;
			options.onProgress = (file, progress) => {
				this.setState({ files: this.state.files });
				sprogress && sprogress(file, progress);
			}
		}
	}

	onFilePrepared(files, file) {
		const lfiles = this.state.files;
		if (lfiles.indexOf(file) === -1) {
			lfiles.push(...files);
		}
		this.setState({ files: lfiles });
	}

	removeFile(file) {
		const index = this.state.files.indexOf(file);
		if (index > -1) {
			this.state.files.splice(index, 1);
			this.setState({
				files: this.state.files
			});
		}
	}

	getFileIcon(file) {
		const { fileInfo } = file;
		if (!fileInfo) return 'unknown';
		switch (fileInfo.kind) {
			case 'application':
				switch (fileInfo.ext) {
					case 'doc':
					case 'docx':
						return 'document';
					break;
				}
			break;
			default: return fileInfo.kind;
		}
		return 'unknown';
	}

	async selectFiles() {
		this.loader.open();
	}

	render() {
		return template.call(this);
	}
}