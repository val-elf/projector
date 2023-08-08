import { IRouter } from '~/backend/core/models';
import { service } from './service'

export enum EMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    PATCH = 'patch',
    OPTIONS = 'options',
    DELETE = 'delete',
}

export interface IRouterOptions {
    tag?: any;
    summary?: string;
    description?: string;
}

export function Router(options?: IRouterOptions) {
    return <T extends { new (...args: any[]): any }>(ctr: T) => {
        return class extends ctr {
            constructor(...args: any[]) {
                super(...args);
                service.registerRouter(this as any as IRouter);
            }
        }
    }
}

export function Route(
    method: EMethod,
    path: string,
    options?: any,
) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        service.registerCallback(method, path, options, originalMethod, target);
    };
}