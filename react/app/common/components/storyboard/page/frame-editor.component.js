import React from 'react';
import PropTypes from 'prop-types';
import template from './frame-editor.template';
import './frame-editor.component.less';

export class FrameEditor extends React.Component {
    static contextTypes = {
        t: PropTypes.func.isRequired,
        table: PropTypes.object.isRequired
    }

    static getDerivedStateFromProps(props, state) {
        const newState = Object.assign({}, state);
        return newState;
    }

    state = {};

    pictureEditorRef = React.createRef();
    get pictureEditor() { return this.pictureEditorRef.current; }

    edit(frame) {
        return new Promise(async resolve => {
            this.resolve = resolve;
            this.setState({ active: true, closing: false, frame });
            setImmediate(() => this.setState({ expanded: true }));
        });
    }

    async close(evt) {
        evt.stopPropagation();
		const { frame } = this.state;
		const image = this.pictureEditor.getImage();
        this.setState({ expanded: false, closing: true, opened: false });
        this.resolve({ frame, image });
    }

    finishTransform(evt) {
        const { closing } = this.state;
        if (closing && evt.propertyName === 'opacity') {
            this.setState({ active: false });
        } else if (!closing && evt.propertyName === 'opacity') {
            this.setState({ opened: true })
        }
    }

    selectTool(tool) {
        if (tool) {
            const toolOptionsClass = tool.getOptionsControl();
            if (!toolOptionsClass) {
                this.setState({ toolOptions: null });
                return;
            }
            const toolOptions = React.createElement(toolOptionsClass, { tool });
            this.setState({ toolOptions });
        }
    }

    render() {
        return template.call(this);
    }
}