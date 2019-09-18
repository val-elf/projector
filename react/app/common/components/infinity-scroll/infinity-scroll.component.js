import React from "react";
import $q from "~/app/common/defer.js";

export class InfinityScroll extends React.Component {
	constructor(props){
		super(props);
		this.dock = {};
		this.onScrollEnd = this.props['onScrollEnd'];
		this.allList = false;
	}

	componentDidMount(){
		this._scrollWatcher = (e) => this.checkIsOnView(e);
		window.addEventListener('scroll', this._scrollWatcher);
		this.checkIsOnView();
	}

	componentWillUnmount(){
		window.removeEventListener('scroll', this._scrollWatcher);
	}

	async scrollProcessor() {
		if (this.onScrollEnd) {
			return await this.onScrollEnd();
		} return false;
	}

	async checkIsOnView(){

		if (this.allList) return;

		const isVisible = this.dock.offsetTop + this.dock.offsetHeight - window.scrollY - document.body.clientHeight < 0;
		if(!this.onScroll && isVisible){
			this.onScroll = true;
			try{
				const result = await this.scrollProcessor();
				this.allList = !result;
				this.forceUpdate();
				this.onScroll = false;
				this.checkIsOnView();
			} catch(err){
				this.forceUpdate();
			} finally {
				this.onScroll = false;
			}
		}
	}

	render(){
		return (<React.Fragment>{this.props.children}<div ref={(node) => {this.dock = node;}}></div></React.Fragment>);
	}
}
