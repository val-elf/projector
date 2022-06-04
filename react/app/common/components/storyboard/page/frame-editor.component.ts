import { Component, createRef, createElement } from 'react';
import { func, object } from 'prop-types';
import template from './frame-editor.template.rt';
import { PictureEditor } from 'controls/picture-editor';
import './frame-editor.component.less';

export class FrameEditor extends Component {
    static contextTypes = {
        t: func.isRequired,
        table: object.isRequired
	}

	resolve: Function;

    static getDerivedStateFromProps(props, state) {
        const newState = Object.assign({}, state);
        return newState;
    }

    state = {
		frame: null,
		closing: false
	};

    pictureEditorRef = createRef();
	get pictureEditor() { return this.pictureEditorRef.current as PictureEditor; }

	constructor(props, state) {
		super(props, state);
		/*storage.subscribe('@toolClass', (state, toolName) => {
			console.log('Toolname', toolName);
			this.selectTool(toolName);
		})*/
	}

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

    selectTool(tool: { getOptionsControl?: Function}) {
        if (tool && tool.getOptionsControl) {
			const toolOptionsClass = tool.getOptionsControl();
            if (!toolOptionsClass) {
                this.setState({ toolOptions: null });
                return;
            }
            const toolOptions = createElement(toolOptionsClass, { tool });
            this.setState({ toolOptions });
        }
    }

    render() {
        return template.call(this);
    }
}