import { App } from '~/app.component';

export class ModalService {
    static async open(modalTypeOrElement, options) {
        return await App.modal.openComponent(options, modalTypeOrElement);
    }

    static async alert(modalTypeOrElement, options) {
        return await App.modal.openComponent(Object.assign(
            { alert: true }, options
        ), modalTypeOrElement);
    }
}