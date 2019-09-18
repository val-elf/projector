export const getVector = (p1, p2) => {
    return { x: p2.x - p1.x, y: p2.y - p1.y };
}

export const scalarMul = (v1, v2) => {
    return v1.x * v2.x + v1.y * v2.y;
}

export const vectorMul = (v1, v2) => {
    return v2.x * v1.y - v2.y * v1.x;
}

export const normalize = (v) => {
    const length = vectorLength(v);
    return { x: v.x / length, y: v.y / length };
}

export const vectorLength = (v) => {
    return Math.sqrt(scalarMul(v, v));
}

export const cosVectors = (v1, v2) => {
    const v1s = normalize(v1);
    const v2s = normalize(v2);
    return scalarMul(v1s, v2s);
}

export const sinVectors = (v1, v2) => {
    const v1s = normalize(v1);
    const v2s = normalize(v2);
    return vectorMul(v1s, v2s);
}

export const distance = (p1, p2) => {
    const vc = getVector(p1, p2);
    return vectorLength(vc);
}

export const setVectorLength = (v, length) => {
    const factor = length / vectorLength(v);
    return { x: v.x * factor, y: v.y * factor };
}

export const toGrad = rad => 180 * rad / Math.PI;

export const heightFactor = Math.sqrt(3) / 2;