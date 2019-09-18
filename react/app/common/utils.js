import React from 'react';

export function getPointHolder(event) {
	event = event.originalEvent || event.nativeEvent || event;
	return event.touches ? [...event.touches] : event;
}

export function clearSelection() {
	window.getSelection().removeAllRanges();
}

export function promisesProcess(stack, callback) {
	return new Promise((resolve, reject) => {
		if (stack.length) {
			callback(stack.shift()).then(() => {
				return promisesProcess(stack, callback).then(() => {
					resolve();
				}, (...args) => {
					reject(...args);
				});
			}, (...args) => {
				reject(...args);
			});
		} else resolve();
	});
}

function copyProps(props) {
	const res = {};
	const flds = Object.keys(props);
	flds.forEach(fld => {
		if (fld === 'children') {
			res.children = decompositeChildren(props[fld]);
		} else res[fld] = props[fld];
	});
	return res;
}

export function decompositeChildren(children) {
	const cldr = childrenToArray(children);
	const res = cldr.map(cld => {
		if (!cld) return null;
		if (typeof(cld) === 'string') return cld;
		if (cld instanceof Array) return decompositeChildren(cld);
		const fields = Object.keys(cld);
		if (fields.length) {
			const res = {};
			for(const prop of Object.keys(cld)) {
				if (prop === 'props') {
					res.props = copyProps(cld[prop]);
				} else {
					res[prop] = cld[prop];
				}
			}
			return res;
		}
	}).filter(cld => cld);
	if (res.length === 1) return res[0];
	return res;
}

export function childrenToArray(children) {
	if (!children) return [];
	if (children instanceof Array) return children;
	return [children];
}

export function findChildrenBy(criteria, children, findAll = false) {
	children = childrenToArray(children).filter(child => child);
	if (!children.length) return [];
    const items = children
        .filter(cld => cld && criteria(cld));
    if (!findAll && items.length) return items;

    for(let child of children) {
        if (typeof(child) === 'string') continue;
        if (child instanceof Array) items.push(...findChildrenBy(criteria, child, findAll));
        else if (child.props) {
			const res = findChildrenBy(criteria, child.props.children, findAll);
			items.push(...res);
		}
	}
	return items;
}

export function findChildrenByProp(propName, propValue, children, findAll) {
	return findChildrenBy(item => {
		if (!item.props) return false;
		return item.props[propName] && item.props[propName] === propValue;
	}, children, findAll);
}

export function findChildrenByClass(sourceName, children, findAll) {
	return findChildrenBy(item => {
		if (!item.props) return false;
		const { className } = item.props;
		const clss = className && className.split(/ +/) || [];
		return clss.indexOf(sourceName) > -1;
	}, children, findAll)
}

export const rgb2hex = rgb => {
	return `${colorToHex(rgb.r)}${colorToHex(rgb.g)}${colorToHex(rgb.b)}`;
}

export const hex2rgb = hex => {
    const pts = hex.match(/^([\dA-F]{2})([\dA-F]{2})([\dA-F]{2})$/i);
    if (pts) {
        const [ , rs, gs, bs ] = pts;
        const r = parseInt(rs, 16);
        const g = parseInt(gs, 16);
        const b = parseInt(bs, 16);
        return { r, g, b };
    } else return { r: 0, g: 0, b: 0 };
}
