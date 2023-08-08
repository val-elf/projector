export function isObject(item: any) {
    return item && typeof item === "object" && !Array.isArray(item);
}

export function mergeDeep(target: any, source: any) {
    let output = Object.assign({}, target);

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = mergeDeep(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

export const normalizeCode = (code: string) =>
    code
        .replace(/\/\/.*?$/gm, '')
        .replace(/\s+/g, ' ')
    ;

export const isBalanced = (code: string, limiters: [string, string] = ['{', '}']) => {
    const [open, close] = limiters;
    const openCount = (code.match(new RegExp(open, 'g')) || []).length;
    const closeCount = (code.match(new RegExp(close, 'g')) || []).length;
    return openCount === closeCount;
}

export const getBalancedEnd = (code: string, limiters: [string, string] = ['{', '}']) => {
    const [open, close] = limiters;
    let openCount = 0;
    let closeCount = 0;
    for (let i = 0; i < code.length; i++) {
        if (code.charAt(i) === open) openCount++;
        if (code.charAt(i) === close) closeCount++;
        if (openCount === closeCount) return i;
    }
    return -1;
}