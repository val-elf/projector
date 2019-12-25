import React from 'react';
import ReactDOM from 'react-dom';
import { decompositeChildren, findChildrenByProp } from '~/common/utils';
import './drag-n-drop.component.less';

function getEventPoint(event) {
    const { pageX: x, pageY: y } = (() => {
        if (event.touches) {
            return event.touches[0];
        }
        return event;
    })();
    return { x, y };
}

export class DragNDrop extends React.Component {
    static getDerivedStateFromProps(props, state) {
		const newState = Object.assign({}, state);
		const { receivers } = props;
        const children = decompositeChildren(props.children);
        const items = findChildrenByProp('draggableItem', true, children, true);
        items.forEach(item => {
            if (!item.ref) item.ref = React.createRef();
            delete item.props['draggableItem'];
		});
        Object.assign(newState, {
            children,
			items,
			receivers
		});
		return newState;
    }

    constructor(...props) {
        super(...props);
        this.host = document.createElement('div');
        this.host.classList.add('dnd-host');
        document.body.appendChild(this.host);
    }

    state = { control: this };
    eventHandlers = [];

    getDistance(point, bound) {
        const bx = bound.left + bound.width / 2;
        const by = bound.top + bound.height / 2;
        const dx = point.x - bx;
        const dy = point.y - by;
        return dx * dx + dy * dy;
    }

    getNearestItem(source, position, nodes) {
        const nearest = {};
        const sourceIndex = nodes.indexOf(source);
        nodes.forEach((node, index) => {
            if (!node.getBoundingClientRect) return;
            const boundary = node.getBoundingClientRect();
            const distance = this.getDistance(position, boundary);
            if (!nearest.node || nearest.distance > distance) {
                Object.assign(nearest, { node, index, distance });
            }
        });
        if (nearest.node && nearest.node !== source) {
            let { node, index } = nearest;
            if (sourceIndex < index) node = node.nextSibling;
            return { node };
        }
    }

    startDrag(node, evt) {
        if (evt.button !== undefined && evt.button !== 0) return;
		evt.stopPropagation();
		//evt.preventDefault();
        const { x, y } = getEventPoint(evt);
        const boundary = node.getBoundingClientRect();
        const index = [...node.parentNode.childNodes].indexOf(node);
        const dragInfo = {
            first: true,
            location: { x, y },
            boundary,
            node,
            index
        };
        document.addEventListener('mousemove', this.getHandler(dragInfo, this.drag));
        document.addEventListener('mouseup', this.getHandler(dragInfo, this.endDrag))
        document.addEventListener('touchmove', this.getHandler(dragInfo, this.drag));
        document.addEventListener('touchend', this.getHandler(dragInfo, this.endDrag))
    }

    firstStep(info) {
        const { node, boundary } = info;

        const dragItem = node.cloneNode(true);// draggable item

        const pstyle = node.parentNode.className;
        this.host.className += ` ${pstyle}`;

        Object.assign(dragItem.style, {
            transition: 'none',
            position: 'absolute',
            opacity: 0.7,
            width: `${boundary.width}px`,
            height: `${boundary.height}px`,
            left: `${boundary.left}px`,
            top: `${boundary.top}px`
        });
        node.style.opacity = 0.3;
        this.host.appendChild(dragItem);
        const selection = window.getSelection();
        selection.removeAllRanges();
        return { dragItem, first: false };
    }

    drag(info, evt) {
		evt.stopPropagation();
		evt.preventDefault();
        const { node, boundary, location } = info;
        const { x, y } = getEventPoint(evt);
        const delta = {
            x: x - location.x,
            y: y - location.y
        }
        const parent = node.parentNode;
        if (info.first) {
            if (delta.x * delta.x + delta.y * delta.y > 25)
                Object.assign(info, this.firstStep(info));
            else return;
        }

        const { dragItem } = info;
        const position = {
            x: boundary.left + delta.x,
            y: boundary.top + delta.y
        };
        const nearest = this.getNearestItem(
            node,
            { x, y },
            [...parent.childNodes]
        );
        Object.assign(dragItem.style, {
            left: `${position.x}px`,
            top: `${position.y}px`
        });
        if (nearest && info.nearest !== nearest.node) {
            if (nearest.node !== node) parent.insertBefore(node, nearest.node);
            info.nearest = nearest.node;
        }
    }

    endDrag(info) {
        const { node } = info;
        document.removeEventListener('mousemove', this.getHandler(info, this.drag));
        document.removeEventListener('mouseup', this.getHandler(info, this.endDrag));
        document.removeEventListener('touchmove', this.getHandler(info, this.drag));
        document.removeEventListener('touchend', this.getHandler(info, this.endDrag));
        if (info.dragItem) this.host.removeChild(info.dragItem);
        node.style.opacity = null;
        const newIndex = [...node.parentNode.childNodes].indexOf(node);
        if (this.props.onChangeOrder) this.props.onChangeOrder(info.index, newIndex);
    }

    getHandler(node, handler) {
        let exist = this.eventHandlers.find(store => store.node === node && store.handler === handler);
        if (exist) return exist.caller;
        exist = {
            node,
            handler,
            caller: evt => {
                handler.call(this, node, evt);
            }
        };
        this.eventHandlers.push(exist);
        return exist.caller;
    }

    get nodes() {
        return this.state.items.map(item => {
            if (!item.ref && !item.ref.current) return null;
            let node = item.ref.current;
            if (node instanceof React.Component) node = ReactDOM.findDOMNode(node);
            return node;
        }).filter(node => node);
    }

    get children() {
        return this.state.children;
    }

    freshDndItems(nodes) {
        nodes.forEach(node => {
            node.addEventListener('mousedown', this.getHandler(node, this.startDrag))
            node.addEventListener('touchstart', this.getHandler(node, this.startDrag));
        });
    }

    releaseDndItems(nodes) {
        nodes.forEach(node => node.removeEventListener('mousedown', this.getHandler(node, this.startDrag)));
        nodes.forEach(node => node.removeEventListener('touchstart', this.getHandler(node, this.startDrag)));
    }

    componentDidMount() {
        this.freshDndItems(this.nodes);
    }

    componentWillUnmount() {
        this.releaseDndItems(this.nodes);
    }

    componentDidUpdate() {
        this.freshDndItems(this.nodes);
    }

    render() {
        return this.children;
    }
}