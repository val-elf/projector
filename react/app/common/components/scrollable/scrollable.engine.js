import ResizeObserver from "resize-observer-polyfill";

function sign(x){
	return x > 0 ? 1: x < 0 ? -1 : 0;
}

const	_toggleClass = (element, className, value) => {
	const hasClass = element.classList.contains(className);
	if (value && !hasClass) element.classList.add(className);
	else if (!value && hasClass) element.classList.remove(className);
}


const frictionFactor = (offset, snorm, flightOut) => {
	if(offset !== undefined){
		offset = Math.abs(offset);
		return offset < 35 ? -0.25 :
				offset < 55 ? -0.27 :
				offset < 100 ? -0.32 :
				offset < flightOut ? -0.7 : -0.9;
	}
	return -0.05;
};

const elasticFactor = (offset, snorm, flightOut) => {
	var anorm = sign(offset * snorm);
	offset = Math.abs(offset);
	if(anorm < 0){
		return offset < 55 ? -0.02 :
			offset < 70 ? -0.02 :
			offset < 85 ? -0.03 :
			offset < 90 ? -0.05 :
			offset < flightOut ? -0.06 : -0.1
		;
	} else {
		return offset < 35 ? -0.02 :
			offset < 40 ? -0.03 :
			offset < 65 ? -0.05 :
			offset < 70 ? -0.09 :
			offset < flightOut ? -0.13 : -0.2
		;
	}
};

export class ScrollableEngine {
	constructor(control, element, orientation) {
		this.orientation = orientation || 'vertical';

		this.container = element;
		this.slider = element.querySelector(".slider");
		this.marker = element.querySelector(".scroll-marker");
		this.edgeStart = element.querySelector(".shadow-edge.start");
		this.edgeEnd = element.querySelector(".shadow-edge.end");
		this.scrollMarkerDock = element.querySelector(".scroll-marker-dock");

		this.maxHeight = parseInt(this.container.style.maxHeight);

		this.speed = 0;
		this.dragSpeed = [];
		this.friction = 0;
		this.flightOut = 150;
		this.outside = false;
		this._inMove = false;

		this.dimension = this.orientation === 'vertical' ? 'offsetHeight' : 'offsetWidth';
		this.operated = this.orientation === 'vertical' && 'top' || 'left';
		this.axis = this.orientation === 'vertical' && 'Y' || 'X';

		this.sliderDimension = 0; // slider dimension
		this.containerDimension = 0; // container dimension
		this.mdim = 0; // marker dimension
		this.sliderPosition = 0; // init slider position

		this.markerAnchor = 0;
		//this.markerPos = 0;
		this.passedEdge = false;

		/* event handlers */
		this._onReachEnd = [];

		this.init();
	}

	get cssDimension() {
		return this.dimension === 'offsetWidth' ? 'width' : 'height';
	}

	destroy() {
		// remove all listeners from items
	}

	dragMarkerHandler = (evt) => this.dragMarker(evt);
	dragSliderHandler = (evt) => this.dragSlider(evt);
	stopDragMarkerHandler = (evt) => this.stopDragMarker(evt);
	stopDragSliderHandler = (evt) => this.stopDragSliderFinal(evt);

	init() {
		this.marker.addEventListener('mousedown', (evt) => this.startDragMarker(evt));
		this.slider.addEventListener('touchstart', (evt) => this.startDragSlider(evt), false);
		this.container.addEventListener('wheel', (evt) => this.wheelMouse(evt));

		this.resizeObserver = new ResizeObserver(() => {
			this.initDimensions();
		});
		this.mutationObserver = new MutationObserver(() => {
			this.initDimensions();
		})
		this.resizeObserver.observe(this.slider);
		this.mutationObserver.observe(this.slider, {
			childList: true,
			subtree: true
		});
	}

	initDimensions() {
		let ht = this.slider[this.dimension];
		this.sliderDimension = ht;
		this.containerDimension = this.container[this.dimension];

		this.topPos = this.containerDimension < this.sliderDimension ? this.containerDimension - this.sliderDimension : 0;
		this.nonmovable = this.containerDimension >= this.sliderDimension;

		if(this.nonmovable || this.sliderPosition > 0){
			this.sliderPosition = 0;
			this.speed = 0;
			this.setPosition(0, true);
		}

		this.mdim = Math.round(this.containerDimension / this.sliderDimension * this.containerDimension);

		if(this.mdim < 40) this.mdim = 40;

		const mloc = {};
		mloc[this.cssDimension] = this.mdim + 'px';
		Object.assign(this.marker.style, mloc);
		this.updateElementStates();


		// check if slider bottom on the view shoud fire onReachEnd event
		if (this.sliderPosition + ht <= this.containerDimension) {
			this.fire('onReachEnd', { side: 'bottom' });
		}
	}

	get inMove() {
		return this._inMove;
	}

	set inMove(value) {
		this._inMove = value;
	}

	actSliderPosition() {
		Object.assign(this.slider.style, {
			transform: `translate${this.axis}(${Math.round(this.sliderPosition)}px)`
		});
	}

	actMarkerPosition() {
		Object.assign(this.marker.style, {
			[this.operated]: this.markerPos + 'px'
		});
	}

	updateElementStates() {
		const pos = Math.round(this.sliderPosition);
		_toggleClass(this.scrollMarkerDock, 'showed', this.inMove || this.markerDrag);
		_toggleClass(this.scrollMarkerDock, 'hidden', this.nonmovable);
		_toggleClass(this.marker, 'active', this.inMove || this.markerDrag);
		_toggleClass(this.edgeStart, 'active', pos < 0);
		_toggleClass(this.edgeEnd, 'active', pos > this.topPos);

		this.actMarkerPosition();
		this.actSliderPosition();

	}

	wheelMouse(evt) {
		var evt = evt && evt.originalEvent || evt;
		if(this.nonmovable) return;
		evt.preventDefault();
		this.addSpeed(evt['wheelDelta' + this.axis] * 2, 1000);
	}

	startDragSlider(evt) {
		evt.preventDefault();
		evt = evt.originalEvent || evt;
		this.slider.addEventListener('touchend', this.stopDragSliderHandler, false);
		this.slider.addEventListener('touchmove', this.dragSliderHandler, false);
		this.inMove = false;
		this.dragSpeed = [];
		this.sliderPos = evt.touches[0]['page' + this.axis];
		this.sliderTime = new Date().getTime();
	}

	dragSlider(evt) {
		evt.preventDefault();
		evt = evt.originalEvent || evt;

		const npos = evt.touches[0]['page' + this.axis];
		const delta = npos - this.sliderPos;
		const dt = new Date().getTime();

		this.sliderPos = npos;
		this.dragSpeed.unshift({ delta: delta, time: dt - this.sliderTime });
		this.sliderTime = dt;

		this.setPosition(this.sliderPosition + delta, true);
	}

	stopDragSlider(evt){
		this.inMove = false;
		evt = evt.originalEvent || evt;
		const lastDelta = this.endpoint;
		const speed = this.dragSpeed
									.slice(0, 5)
									.reduce((res, value) => {
										res.delta += value.delta;
										res.time += value.time;
										return res;
									}, {delta: 0, time: 0});
		const rspeed = speed.delta / speed.time * 250;
		Math.abs(rspeed) > 50 && this.addSpeed(rspeed, 13000);

		clearInterval(this.speedDowner);
	}

	halt = evt => evt.preventDefault();

	startDragMarker(evt){
		evt.preventDefault();
		this.markerDrag = true;
		document.addEventListener('mousemove', this.dragMarkerHandler);
		document.addEventListener('mouseup', this.stopDragMarkerHandler);
		this.markerAnchor = evt['page' + this.axis];
	}

	stopDragSliderFinal(evt) {
		this.stopDragSlider(evt);
		this.slider.removeEventListener('touchend', this.stopDragSliderHandler);
		this.slider.removeEventListener('touchmove', this.dragSliderHandler);

		if (!this.inMove) {
			const opts = {
				'view': window,
				'bubbles': true,
				'cancelable': true
			};
			const click = new MouseEvent('click', opts);
			const enter = new MouseEvent('mouseover', opts);
			evt.target.dispatchEvent(enter);
			evt.target.dispatchEvent(click);
		}
	}

	dragMarker(evt){
		evt.preventDefault();
		var delta = evt[`page${this.axis}`] - this.markerAnchor;
		this.markerAnchor = evt[`page${this.axis}`];

		if(this.markerPos + delta < 0) delta = -this.markerPos;
		if(this.markerPos + delta + this.mdim > this.containerDimension) delta = this.containerDimension - this.mdim - this.markerPos;

		const markerPos = this.markerPos + delta;

		const cpos = -markerPos * this.containerDimension / this.mdim;
		this.setPosition(cpos);
	}

	stopDragMarker(evt){
		evt.preventDefault();
		evt.stopPropagation();
		document.removeEventListener('mousemove', this.dragMarkerHandler);
		document.removeEventListener('mouseup', this.stopDragMarkerHandler);
		this.markerDrag = false;
	}

	startMove(){
		if(!this.mover) this.mover = setInterval(() => this.moveSlider(), 10);
	}

	stopMove(){
		clearInterval(this.mover);
		this.speed = 0;
		this.friction = 0;
		this.mover = null;
	}

	on(eventName, cb) {
		switch( eventName ) {
			case 'onReachEnd':
				this._onReachEnd.push(cb);
			break;
		}
	}

	off(eventName, cb) {
		switch( eventName ) {
			case 'onReachEnd':
			this._onReachEnd = this._onReachEnd.filter(_cb => _cb !== cb);
			break;
		}
	}

	fire(eventName, params) {
		switch( eventName ) {
			case 'onReachEnd':
			this._onReachEnd.forEach(cb => cb(params));
			break;
		}
	}

	moveSlider(){
		let offset;
		let elastic = 0;

		this.outside = this.sliderPosition > 0 || this.sliderPosition < this.topPos;
		if(this.outside){
			if(!this.passedEdge){
				this.passedEdge = true;
				this.fire('onReachEnd', { side: this.sliderPosition > 0 ? 'top' : 'bottom' });
			}
			offset = this.sliderPosition > 0 ? this.sliderPosition + this.speed: this.sliderPosition - this.topPos + this.speed;
			if(this.sliderPosition > 0 && offset >= this.flightOut || this.sliderPosition < this.topPos && offset <= -this.flightOut){
				this.sliderPosition = this.sliderPosition > 0 ? this.flightOut : this.topPos - this.flightOut;
				offset = this.sliderPosition > 0 ? this.flightOut : -this.flightOut;
				this.speed = this.sliderPosition > 0 ? -0.0001 : 0.0001;
			}
			elastic = offset * elasticFactor(offset, sign(this.speed), this.flightOut);
		} else {
			if(this.passedEdge) this.passedEdge = false;
		}

		if(isNaN(this.speed) || (!this.outside && Math.round(this.speed / 2) === 0)){
			this.stopMove();
			return;
		}

		this.sliderPosition += this.speed;
		this.speed = this.speed + this.friction + elastic;
		this.speed = Math.round(this.speed * 100) / 100;
		this.friction = this.speed * frictionFactor(offset, sign(this.speed), this.flightOut);
		this.updateElementStates();
	}

	get markerPos() {
		return (this.sliderPosition / this.topPos) * (this.containerDimension - this.mdim);
	}

	addSpeed(svector, time){
		if(this.nonmovable) return;

		time = time || 3000;
		var cfriction = time / 100;
		if(!this.outside && this.speed * svector < 0) this.speed = this.speed / 5;
		else
			this.speed += 2 * svector / 29;

		this.friction = this.speed * frictionFactor();
		this.startMove();
	}

	setPosition(pos, force){
		if(!force && this.nonmovable) return;

		this.sliderPosition = pos;
		this.outside = false;
		this.passedEdge = false;
		this.speed = 0;

		this.updateElementStates();
	}
}