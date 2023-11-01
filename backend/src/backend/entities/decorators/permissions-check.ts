import { DbObjectBase } from '../dbbase';

export const PermissionsCheck = ({ permissions }: {
    permissions: string[]
}) => {
    return function(target: DbObjectBase<any, any>, propertyKey: string, descriptor: PropertyDescriptor) {
        const source = descriptor.value;
        descriptor.value = async function(...args: any[]) {
            const user = await this.getCurrentUser();
            return source.apply(this, [...args, user]);
        }
    }
}