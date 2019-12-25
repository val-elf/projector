export * from '~/common/colors';

export const HSV2RGB = (hue, saturation, value) => {
    const C = value * saturation;
    const X = C * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = value - C;
    let rs, gs, bs;
    if (hue < 60) { rs = C; gs = X; bs = 0; }
    else if (hue < 120) { rs = X; gs = C; bs = 0; }
    else if (hue < 180) { rs = 0; gs = C; bs = X; }
    else if (hue < 240) { rs = 0; gs = X; bs = C; }
    else if (hue < 300) { rs = X; gs = 0; bs = C; }
    else { rs = C; gs = 0; bs = X; }
    const res = {
        r: Math.round((rs + m) * 255),
        g: Math.round((gs + m) * 255),
        b: Math.round((bs + m) * 255)
    };
    return res;
}

export const RGB2HSV = rgb => {
    let rs = rgb.r / 255;
    let gs = rgb.g / 255;
    let bs = rgb.b / 255;
    const Cmax = Math.max(rs, gs, bs);
    const Cmin = Math.min(rs, gs, bs);
    const delta = Cmax - Cmin;
    const saturation = Cmax === 0 ? 0 : delta / Cmax;
    const value = Cmax;
    let hue = delta === 0 ? 0 :
        Cmax === rs ? 60 * (((gs - bs) / delta) % 6) :
        Cmax === gs ? 60 * (((bs - rs) / delta) + 2) :
        60 * (((rs - gs) / delta) + 4);
    if (hue < 0) hue += 360;
    return { hue, saturation, value };
}

export const getValue = rgb => {
    let rs = rgb.r / 255;
    let gs = rgb.g / 255;
    let bs = rgb.b / 255;
    return Math.max(rs, gs, bs);
}

export const getLightness = rgb => {
    let rs = rgb.r / 255;
    let gs = rgb.g / 255;
    let bs = rgb.b / 255;
    const Cmax = Math.max(rs, gs, bs);
    const Cmin = Math.min(rs, gs, bs);
    return (Cmax + Cmin) / 2;
}

export const HSL2RGB = (hue, saturation, lightness) => {
    const C = (1 - Math.abs( 2 * lightness - 1)) * saturation;
    const X = C * (1 - Math.abs( (hue / 60) % 2 - 1));
    const m = lightness - C / 2;
    let rs, gs, bs;
    if (hue < 60) { rs = C; gs = X; bs = 0; }
    else if (hue < 120) { rs = X; gs = C; bs = 0; }
    else if (hue < 180) { rs = 0; gs = C; bs = X; }
    else if (hue < 240) { rs = 0; gs = X; bs = C; }
    else if (hue < 300) { rs = X; gs = 0; bs = C; }
    else { rs = C; gs = 0; bs = X; }
    const res = {
        r: Math.round((rs + m) * 255),
        g: Math.round((gs + m) * 255),
        b: Math.round((bs + m) * 255)
    };
    return res;
}

export const RGB2HSL = rgb => {
    let rs = rgb.r / 255;
    let gs = rgb.g / 255;
    let bs = rgb.b / 255;
    const Cmax = Math.max(rs, gs, bs);
    const Cmin = Math.min(rs, gs, bs);
    const delta = Cmax - Cmin;
    const lightness = (Cmax + Cmin) / 2;
    const saturation = delta === 0 ? 0 : delta / (1 - Math.abs( 2 * lightness - 1));
    const hue = delta === 0 ? 0 :
        Cmax === rs ? 60 * (((gs - bs) / delta) % 6):
        Cmax === gs ? 60 * (((bs - rs) / delta) + 2) :
        60 * (((rs - gs) / delta) + 4);
    return { hue, saturation, lightness };
}
