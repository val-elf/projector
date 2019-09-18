import React from "react";
import PropTypes from "prop-types";
import moment from 'moment';
import { setLanguage } from "redux-i18n";
import { connect } from "react-redux";
import template from "./language-switcher.template";

export class LanguageSwitcherBase extends React.Component {
	constructor() {
		super(...arguments);

		this.languages = [
			'en', 'ru'
		]
	}

	static propTypes = {
		setLanguage: PropTypes.func.isRequired,
	};

	setLanguage(locale) {
		this.props.setLanguage(locale);
		moment.locale(locale);
	}

	render() {
		return template.call(this);
	}
}

const mapDispatchToProps = {
	setLanguage,
}

export const LanguageSwitcher = connect((props) => {
	return {
		language: props.i18nState.lang
	};
}, mapDispatchToProps)(LanguageSwitcherBase);
