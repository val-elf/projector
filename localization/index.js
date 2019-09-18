import english from "./data/en-us";
import russian from "./data/ru-ru";

const prepare = (item, key) => {
	const res = {};
	if (typeof(item) === 'string') {
		res[key] = item;
	} else {
		const keys = Object.keys(item);
		keys.forEach(lkey => {
			const litem = item[lkey];
			Object.assign(res, prepare(litem, key ? `${key}_${lkey}` : lkey));
		})
	}
	return res;
}

const translations = {
	ru: prepare(russian),
	en: prepare(english),
};

export { translations };
