import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import I18n, { i18nState } from 'redux-i18n';
import { translations } from '_localizations';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import moment from 'moment';

import "./index.less";

import { App } from './app.component';
import { Project } from "projector/services/project-reducer";
import { MUITheme } from 'projector/common/mui-theme';
import { Service } from "projector/api/engine";

let _api = document.head.querySelector(`meta[name='apiUrl']`).attributes['content'].value;
export const apiUrl = _api[0] !== '/' ? `/${_api}` : _api;

let theme;
Service.defaultProps.serviceUrl = apiUrl;

export const store = createStore(combineReducers({
	i18nState,
	Project
}));

(function setupApplication() {
	window.$moment = moment;
	theme = createMuiTheme(MUITheme);
	theme.palette.primary.A700 = '#371C63';
	theme.palette.primary.main = '#371C63';
	theme.palette.primary.dark = '#371C63';
	console.log("PLT", theme.palette);
})();

class MyMomentUtils extends MomentUtils {
	constructor() {
		super(...arguments);
		this.dateFormat = 'DD MMM YYYY';
		this.dateTime12hFormat = 'DD MMM YYYY HH:mm';
		this.dateTime24hFormat = 'DD MMM YYYY HH:mm';
	}
}

const initLang = 'ru';
moment.locale(initLang);

export const Application = render(
	<Provider store={store}>
		<I18n translations={translations} initialLang={initLang}>
			<MuiThemeProvider theme={theme}>
				<MuiPickersUtilsProvider utils={MyMomentUtils} moment={moment} locale={initLang}>
					<App/>
				</MuiPickersUtilsProvider>
			</MuiThemeProvider>
		</I18n>
	</Provider>
	,
	document.getElementById('root')
);


