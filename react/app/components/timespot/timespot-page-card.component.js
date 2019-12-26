import React from 'react';
import PropTypes from 'prop-types';
import { DocumentsService, TimespotCharacter } from "api";
import { ModalService } from 'controls/materials';
import { TimespotCard } from './timespot-card.component';
import template from './timespot-page-card.template';

export class TimespotPageCard extends React.Component {
    static contextTypes = {
		t: PropTypes.func.isRequired
    }

    static getDerivedStateFromProps(props, state) {
		const { timespot } = props;
		const newState = Object.assign({}, state);
        if (state.timespot !== timespot) {
            Object.assign(newState, {
				timespot,
				selectedItem: null
			});
        }
        return newState;
	}

	isSpotAutosaved = false;
	state = {};
	editorOptions = {};

	async getTimespotInfo(spot) {
		this.setState({ loading: true });
		const locations = await spot.locations;
		if (this._isUnmount) return;
		this.setState({ locations, loading: false });
	}

	shouldComponentUpdate(newProps, newState) {
		if (newState.timespot !== this.state.timespot) {
			this.getTimespotInfo(newState.timespot);
		}
		return true;
	}

	componentDidMount() {
		this._isUnmount = false;
		this.getTimespotInfo(this.state.timespot);
	}

	componentWillUnmount() {
		this._isUnmount = true;
	}

	updateTimespotState() {
		const { timespot } = this.state;
		if (this.props.onChange) this.props.onChange();
		this.setState({ timespot });
	}

	async changeTimespotName(value) {
		const { timespot } = this.state;
		timespot.title = value;
		await timespot.save();
		this.updateTimespotState();
	}

	async toggleSpotLocked() {
		const { timespot } = this.state;
		await timespot.toggleLocked();
		this.updateTimespotState();
	}

	async editSpot() {
		const { timespot } = this.state;
		try{
			const res = await ModalService.open(TimespotCard, {
				title: timespot.title,
				content: { timespot }
			});
			['title', 'startDate', 'endDate'].forEach(key => {
				timespot[key] = res[key];
			});
			await timespot.save();
			this.updateTimespotState();
		} catch (error) { }
	}

	selectItem(item) {
		const isSelect = item !== this.state.selectedItem;
		this.setState({
			selectedItem: isSelect ? item : null
		});
		return isSelect;
	}

	isTimespotCharacter(item) {
		return item.constructor === TimespotCharacter;
	}

	changeTimeSpotName() {

	}

	hasCharacters() {
		const chars = this.state.timespot && this.state.timespot.characters || [];
		return !!chars.length;
	}

    render() {
        return template.call(this);
    }
}