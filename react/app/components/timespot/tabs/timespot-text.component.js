import React from 'react';
import PropTypes from 'prop-types';
import template from './timespot-text.template.rt';

export class TimespotText extends React.Component {
    static contextTypes = {
        t: PropTypes.func.isRequired
    };

    static getDerivedStateFromProps(props, state) {
        const newState = Object.assign({}, state);
        const { spot } = props;
        if (newState.spot !== spot) newState.spot = spot;
        return newState;
    }

    state = {
        loading: false,
        fullScreen: false,
        spotAutoSave: false
    };

    editorOptions = {

    }

    get spotAutoSave() {
		return this.isSpotAutosaved;
	}

	set spotAutoSave(value) {
		this.isSpotAutosaved = value;
    }

    async getTimespotDocuments() {
        const { spot } = this.state;
        this.setState({ loading: true });
        const docs = await spot.documents;
        const doc = docs && docs[0] || DocumentsService.create(spot);
        this.setState({ spotDocument: doc, docs, loading: false });
    }

    componentDidMount() {
        const { spot } = this.state;
        if (spot) this.getTimespotDocuments();
    }

    componentDidUpdate(pprops, pstate) {
        const { spot } = this.state;
        if (pstate.spot !== spot)
            this.getTimespotDocuments();
    }

    updateFSState(expand) {
		this.setState({ fullScreen: expand });
    }

    async saveSpotDocument() {
		const { spotDocument } = this.state;
		await spotDocument.save();
		this.setState({ spotDocument });
    }

    fullscreenModeToggle() {
		let { fullScreen } = this.state;
		fullScreen = !fullScreen;
		this.setState({ fullScreen });
    }

    changeContent(value) {
        const { spotDocument } = this.state;
        spotDocument.content = value;
        if (this.isSpotAutosaved) {
            this.saveSpotDocument();
        }
    }

    render() {
        return template.call(this);
    }
}