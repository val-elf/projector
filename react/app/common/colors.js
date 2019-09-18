export const colorPart2Hex = cindex => {
    let rs = Number(cindex).toString(16);
    if (rs.length === 1) rs = `0${rs}`;
    return rs;
}

export const RGB2rgba = rgb => {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a !== undefined ? rgb.a : 1})`;
}

export const RGB2hex = rgb => {
    return `${colorPart2Hex(rgb.r)}${colorPart2Hex(rgb.g)}${colorPart2Hex(rgb.b)}`;
}

export const hex2RGB = (hex, alpha) => {
    const pts = hex.match(/^#?([\dA-F]{2})([\dA-F]{2})([\dA-F]{2})$/i);
    if (pts) {
        const [ , rs, gs, bs ] = pts;
        const r = parseInt(rs, 16);
        const g = parseInt(gs, 16);
        const b = parseInt(bs, 16);
        return { r, g, b, a: alpha };
    } else return { r: 0, g: 0, b: 0, a: alpha };
}

export const color2RGBA = color => {
    const isrgb = color.match(/^rgba?\s*\((.*)\)\s*$/);
    if (isrgb) {
        const parts = isrgb[1].split(/\s*,\s*/);
        return {
            r: parseInt(parts[0], 10),
            g: parseInt(parts[1], 10),
            b: parseInt(parts[2], 10),
            a: parts[3] ? parseInt(parts[3], 10) : 1
        };
    } else if (color[0] === '#') {
        return hex2RGB(color);
    }
}