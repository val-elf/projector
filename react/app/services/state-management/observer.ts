import { Storage } from '.';

export function observer(configuration: { storage: Storage<any>, watch: string[] }) {
	const { storage, watch } = configuration;

	return function<T extends { new(...args: any[]) }>(cFunction: T) {
		return class extends cFunction {
			constructor(...args: any[]) {
				super(...args);
				(watch || []).forEach(item => {
					storage.subscribe(item, (...values) => {
						this.setState({});
					});
				});
			}
		};
	}
}