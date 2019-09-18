import React from 'react';
import PropTypes from 'prop-types';
import { ModalService } from 'common/materials';
import { SettingsPage } from './modal/settings-page.component';
import template from './settings.template';

export class Settings extends React.Component {

	static contextTypes = {
		t: PropTypes.func.isRequired,
		editor: PropTypes.object.isRequired
	};

	state = {
		active: false
	};

	get editor() { return this.context.editor; }
	get document() { return this.editor.document; }

	async toggleSettings() {
		let { active } = this.state;
		active = !active
		this.setState({ active });
		if (active) {
			try {
				const resizeParams = await ModalService.open(SettingsPage, {
					title: this.context.t('APP_IMAGE_PAGE_SETTINGS'),
					content: { document: this.document }
				});
				this.document.resize(resizeParams);
			}
			catch (err) {}
			finally {
				this.toggleSettings();
			}
		}
	}

	render() {
		return template.call(this);
	}
}