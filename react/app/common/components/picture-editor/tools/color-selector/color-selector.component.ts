import * as React from 'react';
import * as PropTypes from 'prop-types';
import { RGB2hex, hex2RGB, IRGB } from 'common/colors';
import { observer } from '~/services/state-management';
import template from './color-selector.template.rt';
import './color-selector.component.less';
import { ActiveColorTypeEnum } from 'controls/picture-editor/models/editor.model';

import { storage } from "controls/picture-editor/store/store";

/*@observer({
	storage,
	watch: ['@activeColorType', '@color', '@bgcolor']
})*/
export class ColorSelector extends React.Component {

	static contextTypes = {
		editor: PropTypes.object.isRequired
	}

	context: any;

	state = {
		showed: false
	};

	get editor() { return this.context.editor; }
	get color() { return RGB2hex(storage.state.color); }
	get bgcolor() { return RGB2hex(storage.state.bgcolor); }
	get active() { return storage.state.activeColorType; }

	get activeColor() {
		const { active } = this;
		switch (active) {
			case ActiveColorTypeEnum.fore: return storage.state.color;
			case ActiveColorTypeEnum.back: return storage.state.bgcolor;
		}
	}

	set activeColor(value: IRGB) {
		const { active } = this;
		switch(active) {
			case ActiveColorTypeEnum.fore: storage.setColor(value); break;
			case ActiveColorTypeEnum.back: storage.setBgColor(value); break;
		}
	}

	async toggleColorPicker(type: ActiveColorTypeEnum) {
		const { showed } = this.state;
		const { activeColorType } = storage.state;
		if (activeColorType !== type) {
			storage.setActiveColorType(type)
		}
		else this.setState({ showed: !showed });
	}

	render() {
		return template.call(this);
	}
}