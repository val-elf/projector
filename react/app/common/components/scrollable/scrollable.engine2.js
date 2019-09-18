import { ScrollableEngine as SE } from "./scrollable.engine";

const frequency = 10;

export class ScrollableEngine extends SE {

	sliderDestination = 0;
	sliderPosition = 0;
	_speedFactor = 150; //more speed factor makes speed fade slowly
	state = null;

	wheelMouse(evt) {
		this.speedFactor = 150;
		evt.preventDefault();
		const delta = evt[`wheelDelta${this.axis}`] * 2;
		this.run(delta);
	}

	isOnEdge(vector) {
		if (vector > 0 && this.sliderPosition === 0) return true;
		if (vector < 0 && this.sliderPosition === this.topPos) return true;
		return false;
	}

	isOffside(vector) {
		if (this.state === 'backward') {
			if (this.sliderPosition > 0 && vector > 0) return true;
			if (this.sliderPosition < this.topPos && vector < 0) return true;
		}
		return false;
	}

	dragMarker(evt) {
		super.dragMarker(evt);
		this.sliderDestination = this.sliderPosition;
	}

	/* slider events */

	dragSlider(evt) {
		evt.preventDefault();
		evt = evt.originalEvent || evt;
		this.speedFactor = 20;

		const npos = evt.touches[0][`page${this.axis}`];
		const delta = npos - this.sliderPos;
		this.sliderPos = npos;
		this.run(delta);
	}

	run(delta) {
		if (!this.isOnEdge(delta) && !this.isOffside(delta)) {
			const setPosition = this.sliderDestination + delta;
			this.sliderDestination = setPosition;
			this.state = 'normal';
			this.moveSlider();
		}
	}

	_round(value) {
		return Math.round(value * 50) / 50;
	}

	_moveSliderQuant() {
		this.sliderPosition = this.nextPosition;
		this.updateElementStates();
	}

	stopDragSlider(evt) {
		const cspeed = this.currentSpeed;
		if (cspeed === 0) return;
		const delta = this.sliderDestination - this.sliderPosition;
		this.speedFactor = 250;
		const newDelta = delta * cspeed / this.currentSpeed * 3;
		this.sliderDestination = newDelta + this.sliderPosition;
	}


	/* Movement processing */

	get nextPosition() {
		return this._round(this.sliderPosition + this.currentSpeed);
	}

	get distance() {
		return this.sliderDestination - this.sliderPosition;
	}

	get speedFactor() {
		return this._speedFactor;
	}

	set speedFactor(value) {
		this._speedFactor = value;
	}

	get currentSpeed() {
		const sf = this.speedFactor;
		let speed = this.distance / sf * frequency;
		return this._round(speed);
	}

	stopSlider() {
		this.sliderPosition = Math.round(this.sliderPosition);
		this.sliderDestination = this.sliderPosition;
		this.state = null;
		this._mover && clearInterval(this._mover);
		this._mover = null;
		this.updateElementStates();
	}

	onReachEnd() {
		const isReach = this.isReach;
		if (isReach) this.fire('onReachEnd', { side: isReach });
	}

	get isReach() {
		if (this.state === 'backward') return null;
		if (this.sliderPosition >= 0) return 'top';
		if (this.sliderPosition <= this.topPos) return 'bottom';
		return null;
	}

	checkState() {
		this.onReachEnd();
		const speed = this.currentSpeed;
		switch(this.state) {
			case 'normal':
				if (speed > 0) {
					if (this.sliderPosition > 0) {
						this.state = 'backward';
						this.sliderDestination = 0;
					}
				} else if (speed < 0) {
					if (this.sliderPosition < this.topPos) {
						this.state = 'backward';
						this.sliderDestination = this.topPos;
					}
				}
			break;
			case 'backward':
				if (speed === 0) {
					this.stopSlider();
				}
			break;
		}
	}

	moveSlider() {
		if (this._mover) return;
		const speed = this.currentSpeed;
		this.state = 'normal';

		this._mover = setInterval(() => {
			this._moveSliderQuant();
			this.checkState();
		}, frequency);

		this._moveSliderQuant()
	}


}
