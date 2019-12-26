import moment from "moment";
import { store } from "~/index";


export function date(value, format){
	if (!value) return ''

	format = format || 'date';

	switch(format) {
		case 'date': format = 'DD MMM YYYY'; break;
		case 'datetime': format = 'DD MMM YYYY H:mm'; break;
	}

	const lang = store.getState().i18nState.lang;
	moment.locale(lang);
	return moment(value).format(format);
}