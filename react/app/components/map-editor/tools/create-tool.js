import { DefaultTool } from './default-tool';
import { CreateToolProperties } from './properties/create-tool-properties.component';
import template from './create-tool.template';

export class CreateTool extends DefaultTool {
	getPropertiesComponent() {
		return CreateToolProperties;
	}

	render() {
		return template.call(this);
	}
}