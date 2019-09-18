import React from 'react';
import ReactDOM from 'react-dom';
import template from './exchanger-panel.template';
import { decompositeChildren, findChildrenBy, findChildrenByClass } from 'projector/common/utils';

export class ExchangerPanel extends React.Component {
    static getDerivedStateFromProps(props, state)   {
        // find items
        const children = decompositeChildren(props.children);
        const list = findChildrenByClass('list', children)[0];
        if (list) {
            list.ref = React.createRef();
            let items = findChildrenByClass('item', list);
            if (!items.length) items = findChildrenBy(child => React.Component.isPrototypeOf(child.type), list.props.children);
            const refs = items && items.map(item => {
                item.ref = React.createRef();
                return item.ref;
            }) || [];

            Object.assign(state, {
                items,
                refs,
                list
            });
        }
        Object.assign(state, {
            children,
        });
        return state;
    }

    state = { };
    panelRef = React.createRef();

    get name() {
        return this.props.name;
    }

    get exchanger() {
        return this.props.exchanger;
    }

    get children() {
        return this.state.children;
    }

    insertVirtual(virtual, item) {
        const { list } = this.state;
        const listNode = list.ref.current;
        const indexGetter = this.props.getMovedItemIndex || (_ => 0);
        const index = indexGetter(item);

        const base = listNode.children[index];
        listNode.insertBefore(virtual, base);
    }

    componentDidUpdate() {
        this.boundary = this.panelRef.current.getBoundingClientRect();
        this.exchanger.registryPanel(this);
        if (this.state.items && !this.props.hasRef){
            this.state.items.forEach(item => {
                item.props.onClick = event => this.exchange(item.props.item, event);
            });
        }
    }

    cloneItem(item) {
        let source = item;
        if (item instanceof React.Component)
            source = ReactDOM.findDOMNode(item);
        if (source) return source.cloneNode(true);
    }

    getBounding(item) {
        let node = item;
        if (item instanceof React.Component) {
            node = ReactDOM.findDOMNode(item);
        }
        if (node) return [node, node.getBoundingClientRect()];
    }

    flyout(origin, location, boundary) {
        const node = this.cloneItem(origin);
        if (!node) return;
        const [source, bounding] = this.getBounding(origin);
        if (!bounding) return;
        const flyoutContainer = this.exchanger.getFlyoutContainer();

        return new Promise(resolve => {
            flyoutContainer.appendChild(node);
            node.addEventListener('transitionend', _ => {
                if (_.propertyName === 'left' || _.propertyName === 'top') {
                    Object.assign(node.style, { opacity: 0 });
                    resolve();
                }
                if (_.propertyName === 'opacity') {
                    flyoutContainer.removeChild(node);
                }
            });

            source.classList.add('disapeared');
            Object.assign(source.style, {
                visibility: 'hidden',
                height: `${bounding.height}px`,
                width: `${bounding.width}px`
            });

            // implement flightout
            Object.assign(node.style, {
                position: 'absolute',
                left: `${bounding.left}px`,
                top: `${bounding.top}px`,
                width: `${bounding.width}px`,
                height: `${bounding.height}px`
            });
            setTimeout(_ => {
                const top = location.y > boundary.bottom ? boundary.bottom - location.height :
                    location.y < boundary.top ? boundary.top : location.y;
                const left = location.x > boundary.right ? boundary.right - location.height:
                    location.x < boundary.left ? boundary.left : location.x;
                Object.assign(node.style, {
                    left: `${left}px`,
                    top: `${top}px`
                });
                Object.assign(source.style, {
                    height: 0,
                    width: 0
                });
            }, 10);
        });

    }

    prepareToReceiption(item) {
        // insert empty item
        const itemClass = ['item', 'invisible'];
        if (this.props.itemClass) itemClass.push(this.props.itemClass);
        const ref = item.ref.current;
        const clone = this.cloneItem(ref);
        if (!clone) return [];
        clone.classList.remove('disapeared')

        clone.classList.add(...itemClass);
        if (this.props.itemClass) clone.classList.add(this.props.itemClass);
        this.insertVirtual(clone, item.props.item);

        const bounding = clone.getBoundingClientRect() || {};

        Object.assign(clone.style, {
            maxWidth: 0,
            maxHeight: 0
        });
        setTimeout(_ => {
            Object.assign(clone.style, {
                maxWidth: `${bounding.width}px`,
                maxHeight: `${bounding.height}px`
            });
        });
        return [bounding, clone];
    }

    async processMoving(item) {
        if (this.props.onExchange) this.props.onExchange(item);
    }

    async exchange(item) {
        const { state } = this;
        const itemIndex = state.items.findIndex(itm => itm.props.item === item);
        const element = state.items[itemIndex];
        const ref = state.refs[itemIndex];
        const node = ref.current;
        const dest = this.props.exchanger.getPanel(this.props.moveTo);
        if (!dest) return;
        const [location, clone] = dest.prepareToReceiption(element);
        if (location && clone) {
            await this.flyout(node, location, dest.boundary);
            clone.parentNode.removeChild(clone);
        }
        this.processMoving(item);
    }

    render() {
        return template.call(this);
    }
}