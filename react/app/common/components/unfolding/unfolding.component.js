import React from 'react';
import template from './unfolding.template';
import './unfolding.component.less';

export class Unfolding extends React.Component {
    state = {};
    contentRef = React.createRef();
    nodeRef = React.createRef();

    get height() {
        if (!this.contentRef.current) return this.props.height;
        return this.contentRef.current.offsetHeight;
    }

    get freezed() {
        return this.height < this.props.height;
    }

    componentDidMount() {
        const node = this.nodeRef.current;
        this.wrapper = node.querySelector(".unfolding-wrapper");

        this.setState({ height: this.props.height });
        this.listeners = {
            transition: evt => {
                if (!this.state.hover) this.setState({ hovered: false });
            },
            enter: () => {
                if (this.height > this.props.height) {
                    this.setState({ height: this.height, hover: true, hovered: true });
                }
            },
            leave: () => {
                if (this.height > this.props.height) {
                    this.setState({ height: this.props.height, hover: false });
                }
            }
        };

        this.wrapper.addEventListener('transitionend', this.listeners.transition);
        node.addEventListener('mouseenter', this.listeners.enter);
        node.addEventListener('mouseleave', this.listeners.leave);
    }

    componentWillUnmount() {
        const node = this.nodeRef.current;
        this.wrapper.removeEventListener('transitionend', this.listeners.transition);
        node.removeEventListener('mouseenter', this.listeners.enter);
        node.removeEventListener('mouseleave', this.listeners.leave);
    }

    render() {
        return template.call(this)
    }
}