class RectangularsUtils {
    getCorners(bound) {
        const c0 = { x: bound.left, y: bound.top };
        const c1 = { x: bound.left + bound.width, y: bound.top };
        const c2 = { x: bound.left + bound.width, y: bound.top + bound.height };
        const c3 = { x: bound.left, y: bound.top + bound.height };
        return { c0, c1, c2, c3 };
    }

    pointInside(point, bound) {
        return point.x > bound.left && point.x < bound.left + bound.width &&
            point.y > bound.top && point.y < bound.top + bound.height;
    }

    prepareIntersection(point1, point2) {
        const left = Math.min(point1.x, point2.x);
        const top = Math.min(point1.y, point2.y);
        const width = Math.abs(point1.x - point2.x);
        const height = Math.abs(point1.y - point2.y);
        return { left, top, width, height };
    }

    detectIntersectionPoints(ires, corners1, corners2) {
        let pindex1 = ires.indexOf(true);
        let pindex2 = ires.indexOf(true, pindex1 + 1);
        if (pindex1 === 0 && pindex2 === 3) {
            pindex1 = pindex2;
        }
        pindex2 = (pindex1 + 2) % 4;
        const axis = !!(pindex1 % 2);
        const cn = `c${pindex2}`;
        const p1 = corners1[`c${pindex1}`];
        let p2;
        if (axis) {
            p2 = { x: corners2[cn].x, y: corners1[cn].y };
        } else {
            p2 = { x: corners1[cn].x, y: corners2[cn].y };
        }
        return { p1, p2 };
    }

    getIntersect(frame, frame1, distance) {
        const b1 = { left: frame.left - distance, top: frame.top - distance, width: frame.width + 2 * distance, height: frame.height + 2 * distance };
        const corners1 = this.getCorners(b1);
        const corners2 = this.getCorners(frame1);
        const ires1 = Object.keys(corners1).map(c => this.pointInside(corners1[c], frame1));
        const ires2 = Object.keys(corners2).map(c => this.pointInside(corners2[c], b1));
        const placed = ires1.some(c => c) || ires2.some(c => c);
        if (placed) {
            const tcount = ires1.filter(c => c).length;
            switch (tcount) {
                case 4: return { isect: b1, own: true };
                case 0: break;
                case 1:
                    let pindex1 = ires1.indexOf(true);
                    let pindex2 = (pindex1 + 2) % 4;
                    let p1 = corners1[`c${pindex1}`];
                    let p2 = corners2[`c${pindex2}`];
                    return { isect: this.prepareIntersection(p1, p2), own: false };
                case 2: {
                    const { p1, p2 } = this.detectIntersectionPoints(ires1, corners1, corners2);
                    return { isect: this.prepareIntersection(p1, p2), own: false };
                }
            }
            const bcount = ires2.filter(c => c).length;
            switch(bcount) {
                case 2: {
                    const { p1, p2 } = this.detectIntersectionPoints(ires2, corners2, corners1);
                    return { isect: this.prepareIntersection(p1, p2), own: false };
                }
            }
        }
    }

    detectIntersects(frames, distance) {
        if (!frames) return;
        frames.forEach(frm => {
            frm.intersections = [];
        });
        frames.forEach((frame, index) => {
            for(let i = 0; i < index; i ++) {
                const pframe = frames[i];
                const res = this.getIntersect(frame, pframe, distance);
                if (res) {
                    const { own } = res;
                    if (own) frame.intersections.push(res);
                    else pframe.intersections.push(res);
                }
            }
        });
    }

}

export const Rectangulars = new RectangularsUtils();
