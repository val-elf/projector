import { Component } from 'react';
import { func, object } from 'prop-types';
import { ModalService } from 'controls/materials';
import { SettingsPage } from './modal/settings-page.component';
import template from './settings.template.rt';

export class Settings extends Component {

	static contextTypes = {
		t: func.isRequired,
		editor: object.isRequired
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