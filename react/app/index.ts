import 'babel-polyfill';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import I18n, { i18nState } from 'redux-i18n';
import translations from '_localizations';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import moment from 'moment';

import "./index.less";

import { App } from './app.component';
import { Project } from "~/services/project-reducer";
import { MUITheme } from 'common/mui-theme';
import { Service } from "~/api/engine";

let _api = document.head.querySelector(`meta[name='apiUrl']`).attributes['content'].value;
export const apiUrl = _api[0] !== '/' ? `/${_api}` : _api;

let theme;
Service.defaultProps.serviceUrl = apiUrl;

export const store = createStore(combineReducers({
	i18nState,
	Project
}));

(function setupApplication() {
	window.moment = moment;
	theme = createTheme(MUITheme);
	theme.palette.primary.A700 = '#371C63';
	theme.palette.primary.main = '#371C63';
	theme.palette.primary.dark = '#371C63';
	console.log("PLT", theme.palette);
})();

/*class MyMomentUtils extends MomentUtils {
	constructor() {
		super(...arguments);
		this.dateFormat = 'DD MMM YYYY';
		this.dateTime12hFormat = 'DD MMM YYYY HH:mm';
		this.dateTime24hFormat = 'DD MMM YYYY HH:mm';
	}
}*/

const initLang = 'ru';
moment.locale(initLang);
const root = createRoot(document.getElementById('root'));
console.log("ROOT", translations);
export const Application = root.render(
	<Provider store={store}>
		<I18n translations={translations} initialLang={initLang}>
			<ThemeProvider theme={theme}>
				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<App/>
				</LocalizationProvider>
			</ThemeProvider>
		</I18n>
	</Provider>
);


