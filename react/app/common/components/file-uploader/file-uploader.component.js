import React from 'react';
import PropTypes from 'prop-types';
import { ModalService } from 'common/materials/modal.service';
import { FileLoader } from './file-loader';
import { FileSaver } from './file-saver';
import { FileUploaderWindow } from './file-uploader-window.component';
import template from './file-uploader.template.rt';


export class FileUploader extends React.Component {
	state = { files: [] };

	static getDerivedStateFromProps(props) {
		return {
			mode: props.mode || 'button',
			showPreview: props.showPreview !== undefined ? props.showPreview : true
		};
	}

	constructor(props){
		super(props);
		this.initComponent();
	}

	initComponent(){
		this.loader = new FileLoader({
			multiple: !!this.props.multiple,
			accept: this.props.accept || '*',
			onLoad: !this.props.multiple ? files => this.completeFiles(files) : undefined
		});
		if (this.props.uploadTo) {
			this.saver = new FileSaver({
				url: this.props.uploadTo,
				onPreload: this.props.onPreload,
				onPostload: this.props.onPostload,
				onProgress: this.props.onProgress
			});
		}
	}

	componentDidUpdate() {
		this.saver && this.saver.setUrl(this.props.uploadTo);
	}

	selectFiles(){
		if(this.state.mode === 'window'){
			this.openUploadWindow();
		}
		else if(this.state.mode === 'button') this.loader.open();
	}

	openUploadWindow(){
		try{
			ModalService.open(FileUploaderWindow, {
				title: this.context.t('APP_PROJECT_FILE_UPLOAD'),
				className: 'uploader',
				minWidth: 750,
				showFooter: false,
				content: {
					onStartUpload: async files => await this.startUpload(files),
					loader: this.loader,
					saver: this.saver
				}
			});
		} catch (error) { }
	}

	completeFiles(files) { // callback from file selector
		const output = !!this.props.multiple ? files : files[0];
		if (this.state.mode === 'button' && !this.props.multiple) {
			if (output) {
				this.setState( { file: output });
				this.previewHeight = output.preview.height * 30 / output.preview.width;
			}
		}
		else
			this.setState({ files });
		if (this.props.onLoad) {
			this.props.onLoad(output);
		} else if (this.props.uploadTo) {
			this.saver.save(files);
		}
	}

	async startUpload(files) {
		if (this.saver) {
			await this.saver.save(files);
		}
		await this.props.onFinish && this.props.onFinish();
	}

	render(){
		return template.call(this);
	}
}

FileUploader.contextTypes = {
	t: PropTypes.func.isRequired
}