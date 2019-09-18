import React from 'react';
import PropTypes from 'prop-types';
import template from './gallery-content-item.template';
import './gallery-content-item.component.less';

export class GalleryContentItem extends React.Component {
    static contextTypes = {
        t: PropTypes.func.isRequired
    }

    static getDerivedStateFromProps(props, state) {
        const newState = Object.assign({}, state);
        const { document, selected } = props;
        const file = document.coretype === 'files' ? document : document.file;
        if (document && state.document !== document) newState.document = document;
        if (state.file !== file) newState.file = file;
        if (state.initSelected !== selected) {
            newState.selected = selected;
            newState.initSelected = selected;
        }
        return newState;
    }

    documentInfoRef = React.createRef();
    itemContainerRef = React.createRef();
    state = {};
    frequency = 1500;

    get documentInfo() { return this.documentInfoRef.current; }
    get itemContainer() { return this.itemContainerRef.current; }

    componentDidMount() {
        this.hoverIconHandler = this.hoverIcon.bind(this);
        this.leaveIconHandler = this.leaveIcon.bind(this);
        this.itemContainer.addEventListener('mouseenter', this.hoverIconHandler);
        this.itemContainer.addEventListener('mouseleave', this.leaveIconHandler);
    }

    componentWillUnmount() {
        this.itemContainer.removeEventListener('mouseenter', this.hoverIconHandler);
        this.itemContainer.removeEventListener('mouseleave', this.leaveIconHandler);
        if (this.statusChecker) clearInterval(this.statusChecker);
        this.statusChecker = null;
    }

    hoverIcon() {
        this.documentInfo.show();
    }

    leaveIcon() {
        this.documentInfo.hide();
    }

    initChecker() {
        if (this.statusChecker) return;
        this.statusChecker = setInterval(() => this.updateStatus(), this.frequency);
    }

    isNeedCheck(status) {
        return ['lost', 'finished'].indexOf(status) === -1;
    }

    get fileLoading() {
        const { file } = this.state;
        if (!file) {
            // this.initChecker();
            return false;
        }
        const { status } = file;
        if (status && this.isNeedCheck(status.status)) this.initChecker();
        if (this.statusChecker) return true;
    }

    get iconType() {
        const { document } = this.state;
        const file = document.coretype === 'files' ? document : document.file;
        const { metadata } = document;
        const { exif } = file ? file : { exif: {} };
        if (metadata) return metadata.mediatype;

        let { type } = file;
        if (exif) type = exif.mimeType;
        if (/\//.test(type)) type = type.match(/^(.*?)\//)[1];
        return type;
    }

    async freshDocument() {
        const { document } = this.state;
        await document.fresh();
        const file = document.coretype === 'files' ? document : document.file;
        this.setState({ document, file });
    }

    async updateStatus() {
        const { file, document } = this.state;
        if (!file && document !== file) {
            return this.freshDocument();
        };
        const oldvalue = file.status.status;
        const status = await file.freshStatus();
        const { status: stvalue, progress } = status;
        const isStop = stvalue === 'storage-down' || !this.isNeedCheck(stvalue);
        if (isStop) {
            clearInterval(this.statusChecker);
            this.statusChecker = null;
            if (stvalue === 'storage-down') return;
            return this.freshDocument();
        } else if (stvalue === oldvalue) {
            this.setState({ progress });
            return;
        }
        this.setState({ file, progress });
    }

    async select() {
        const selected = !this.state.selected;
        if (this.props.onSelect) await this.props.onSelect(selected);
        this.setState({ selected });
    }

    render() {
        return template.call(this);
    }
}