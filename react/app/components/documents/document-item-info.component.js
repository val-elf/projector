import React from 'react';
import PropTypes from 'prop-types';
import { ModalService } from 'common/materials';
import { DocumentDetails } from './document-details.component';
import template from './document-item-info.template';
import './document-item-info.component.less';

export class DocumentItemInfo extends React.Component {
    static contextTypes = {
        t: PropTypes.func.isRequired
    }

    static getDerivedStateFromProps(props, state) {
        const { document } = props;
        const file = document.coretype === 'documents' ? document.file || {} : document;
        const newState = Object.assign({}, state, { file });

        let { name, size, type } = file;
        const { metadata } = document;
        if (metadata) {
            type = metadata.mediatype;
        } else {
            const match = type.match(/^(.*)\//);
            if (match) type = match[1];
        }
        Object.assign(newState, {
            file,
            name,
            size,
            type
        });

        if (state.document !== document) newState.document = document;
        return newState;
    }

	async openFileInfo(evt) {
        evt.stopPropagation();
        try {
            const { document } = this.state;
            await ModalService.open(DocumentDetails, {
                title: this.title,
                content: {
                    document
                }
            });
            await document.save();
            this.setState({ document });
        }
        catch (error) {}
	}
    state = {
        showed: false
    };
    infoElementRef = React.createRef();

    get infoElement() { return this.infoElementRef.current };

    get title() {
        const { document } = this.state;
        return document.title || document.name || document.file;
    }

    show() {
		this.showFileInfo = setTimeout(() => {
			this.setState({
				showed: true,
			});
			this.showed = null;
		}, 1000);

		this.props.openFileInfo && this.props.openFileInfo(evt);
    }

    hide() {
		this.setState({ isExpanded: false, expandedMargin: 0 });

		if(this.showFileInfo) clearTimeout(this.showFileInfo);
		if (this.canInfoExpanded) Object.assign(this.fileInfo.style, { top: this.height + 'px' });
		this.setState({
			showed: false,
		});
    }

    render() {
        return template.call(this);
    }
}