import { Map } from './map';

const DEGREE_AMNT = 2; //pixels in one degree where zoom = 1
const RAD_DEGREES = 180 / Math.PI;
const RAD_AMNT = RAD_DEGREES * DEGREE_AMNT;

const rad = grd => grd / RAD_DEGREES;
const grd = rad => rad * RAD_DEGREES;
const parallelLocation = rad => Math.log(Math.tan(Math.PI/4 + rad / 2));
const parallelRad = (pos, zoom) => Math.atan(Math.sinh(pos / (RAD_AMNT * zoom)));
const toDegrees = coord => {
    let res = '';
    const sign = coord >= 0 ? '' : '-';
    coord = Math.abs(Math.round(coord* 3600) / 3600);
    if (coord > 1) {
        res += `${Math.floor(coord)}°`;
        coord -= Math.floor(coord);
    }
    //detect minutes
    const minutes = Math.floor(coord * 60);
    const seconds = Math.floor(coord * 3600) - minutes * 60;
    if (minutes > 0) res += ` ${minutes}′`;
    if (seconds > 0) res += ` ${seconds}″`;
    return `${sign}${res}`;
}

const TOP_PARALLEL = rad(80);
const DIVIDERS = [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 30, 45, 60, 90];

// Merchator grid works in natural viewport coordinates, without matrix scaling and positioning
export class MerchatorGrid extends Map {
    line = this.group.path().attr({fill:"violet", stroke: "#000000", "stroke-width": 1, "stroke-opacity": 0.3});
    zero = this.group.path().attr({fill: "violet", stroke: "#000000", "stroke-width": 1.5, "stroke-opacity": 0.5});
    htexts = this.group.group().font({size: 9});

    constructor(host) {
        super(host);
        this.changeView();
        this.viewport.setParent(host.viewport);
    }

    changeView() {
        this.fresh();
    }

    getViewportCoordinates() {
        const res = { x: 0, y: 0, width: this.width, height: this.height };
        let { mwidth, mheight } = this;

        const offset = this.viewport.getOffset();
        const rz = this.viewport.getZoom();
        if (offset.x > 0) res.x = offset.x;
        else if (offset.x < 0) mwidth += offset.x;
        if (offset.y > 0) res.y = offset.y;
        else if (offset.y < 0) mheight += offset.y;

        if (res.x + mwidth > res.width) res.width = res.width - res.x;
        else res.width = mwidth;
        if (res.y + mheight > res.height) res.height = res.height - res.y;
        else res.height = mheight;

        return res;
    }

    get mwidth() {
        return 360 * this.zoom * DEGREE_AMNT;
    }

    get mheight() {
        return this.quantLength * parallelLocation(rad(80)) * 2;
    }

    get pixelsPerDegree() {
        return this.zoom * DEGREE_AMNT;
    }

    get degreeStep() {
        let degrees = 40 / this.pixelsPerDegree; // 40 px - minimum distance between lines
        degrees = 180 / Math.round(180 / degrees);
        if (degrees > 0.9) {
            degrees = DIVIDERS.find(div => div > degrees);
        } else {
            let minutes = Math.round(degrees * 60);
            let seconds = Math.round(degrees * 3600);
            if (minutes > 0) {
                degrees =  minutes / 60;
            } else if (seconds > 0) {
                degrees = seconds / 3600;
            }
        }
        return degrees;
    }

    get radianStep() {
        return rad(this.degreeStep); // ten degrees
    }

    get meridiansCount() {
        return Math.round(360 / this.degreeStep);
    }

    get parallelsCount() {
        return Math.round(160 / this.degreeStep / 2);
    }

    get quantLength() {
        return RAD_AMNT * this.zoom;
    }

    get mapHeight() {
        return this.quantLength * parallelLocation(TOP_PARALLEL) * 2;
    }

    generateMeridians(view) {
        let result = '';
        const stepLength = this.degreeStep * this.pixelsPerDegree; // stepLength is a distance in pixels between meridians
        const { x, y, width, height } = view;
        const shift = this.offset.x < x ? this.offset.x : 0;
        const dshift = shift % stepLength;
        let step = x + dshift;
        this.htexts.clear();
        let deg = -180 + (x - this.offset.x + dshift) / this.pixelsPerDegree;
        let count = Math.abs(Math.floor(shift / stepLength));
        while( step <= x + width) {
            this.htexts.text(toDegrees(deg)).dx(step - 5).dy(y).rotate(-45);
            result += `M${step},${y}L${step},${y + height}`;
            step += stepLength;
            deg += this.degreeStep;
            count ++;
        }
        return result;
    }

    generateParallels(view) {
        let result = '';
        const { x, y, height, width } = view;
        const half = this.mapHeight / 2;
        const oz = this.offset.y + half;
        const step = this.radianStep;

        const tPoint = this.offset.y < y ? -this.offset.y : 0;
        const top = half - tPoint;
        const bottom = top - height < -half ? -half : top-height;
        const topCoord = parallelRad(top, this.zoom);
        const bottomCoord = parallelRad(bottom, this.zoom);
        const pcount = Math.ceil((topCoord - bottomCoord) / step);
        let position = Math.round(topCoord / step) * step;

        for(let i = 0; i < pcount; i ++) { //horizontal without equator
            const gf = this.quantLength * parallelLocation(position);
            this.htexts.text(toDegrees(grd(position))).dx(x + 5).dy(oz - gf - 24);
            result += `M${x},${oz-gf}L${x + width},${oz-gf}`;
            position -= step;
        }

        return result;
    }

    generateGrid(view) {
        return this.generateMeridians(view) + this.generateParallels(view);
    }

    generateEquator(view) {
        const zf = DEGREE_AMNT * this.zoom;
        const { x, y } = this.offset;
        const ox = x + 180 * zf;
        const oy = y + this.mapHeight / 2;
        return `M${x},${oy}L${x  + 360 * zf},${oy}` + 
            `M${ox},${y}L${ox},${y + this.mapHeight}`;
    }

    fresh() {
        const view = this.getViewportCoordinates();
        const noDraw = view.width <= 0 || view.height <= 0;
        this.group.attr('zoom', this.zoom);

        this.line.attr({"d": noDraw ? '' : this.generateGrid(view)});
        this.zero.attr({"d": noDraw ? '' : this.generateEquator(view)});
    };
}
