import React from "react";
import PropTypes from "prop-types";
import template from "./timeline.template";
import { TimespotCard } from "components/timespot";
import { TimespotsService } from "api";
import { ModalService } from 'controls/materials';
import './timeline.component.less';

export class Timeline extends React.Component {
	static childContextTypes = {
		timeline: PropTypes.object.isRequired
	};

	static contextTypes = {
		t: PropTypes.func.isRequired
	};

	getChildContext() {
		return { timeline: this.timeline };
	}

	state = {
		createdSpot: null
	};

	_root = React.createRef();

	static getDerivedStateFromProps(props, state) {
		const { timeline, timespot } = props;
		if (timeline !== state.timeline) {
			const spots = timeline.timespots || [];
			const virtualSpot = TimespotsService.create({
				startOffsetX: 0,
				endOffsetX: 100,
				locked: false,
				timeline
			})

			const startPoint = timeline.startDate || null;
			const endPoint = timeline.endDate || null;

			return Object.assign({}, state, {
				timeline,
				spots,
				virtualSpot,
				startPoint,
				endPoint,
				selected: timespot
			});
		}
		return state;
	}

	shouldComponentUpdate(newProps, newState) {
		if (newState.timeline !== this.state.timeline) {
			this.updateTimelineDimensions(newState.timeline);
		}
		return true;
	}

	updateTimelineDimensions(timeline) {
		const { left, right } = this.root.getBoundingClientRect();
		timeline.setRange(left, right);
	}

	get root() { return this._root.current; }

	get timeline() { return this.state.timeline; }
	get virtualSpot() { return this.state.virtualSpot; }
	get spots() { return this.state.spots; }
	get startPoint() { return this.state.startPoint; }
	get endPoint() { return this.state.endPoint; }

	componentDidMount() {
		this.initRoot();
	}

	initRoot() {
		this.root.addEventListener('mousemove', event => this.mousemove(event));
		this.root.addEventListener('mouseenter', () => {
			this.setState({ showHighlighter: !this.virtual.state.active });
		});

		this.root.addEventListener('mouseleave', () => {
			this.setState({ showHighlighter: false });
		});
		this.updateTimelineDimensions(this.timeline);

		this.posShift = 0;
	}

	mousemove(event) {
		var lp = this.timeline.getRelativeLocation(event.pageX);
		this.virtDate = this.timeline.getDateForPoint(lp);
		this.setState({
			highlighterPosition: lp
		});
	}

	selectSpot(spot) {
		if (this.props.onSelectSpot) this.props.onSelectSpot(spot);
		this.setState({ selected: spot });
	}

	startTimespot(event) {
		const position = this.state.highlighterPosition;
		this.setState({ showHighlighter: false }, _ => {
			this.virtual.startDraw(event, position);
		});
	}

	async updateTimespot(spot) {
		await spot.save();
	}

	async createTimespot(sample) {
		if (sample.startOffsetX === sample.endOffsetX) {
			delete sample.endOffsetX;
			delete sample.endDate;
		}

		sample.timeline = this.timeline;
		const newTimespot = TimespotsService.create(sample);

		try{
			await ModalService.open(TimespotCard, {
				title: this.context.t('APP_TIMESPOT_CREATE_NEW'),
				content: { timespot: newTimespot }
			});
			this.spots.push(newTimespot);
			await newTimespot.save();
			this.setState({ selected: newTimespot });
		} catch (error) { }
	}

	render() {
		return template.call(this);
	}
}

