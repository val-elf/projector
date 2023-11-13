import { DbObjectBase } from '../dbbase';

export const PermissionsCheck = ({ permissions }: {
    permissions: string[]
}) => {
    return function(target: DbObjectBase<any, any>, propertyKey: string, descriptor: PropertyDescriptor) {
        const source = descriptor.value as Function;
        const parameters = getParametersList(source.toString(), propertyKey);
        const needAddUser = parameters[parameters.length - 1] === 'user';
        descriptor.value = async function(...args: any[]) {
            const user = await this.getCurrentUser();
            const outArgs = [...args];
            if (needAddUser) {
                while (outArgs.length < parameters.length - 1) {
                    outArgs.push(undefined);
                }
                outArgs.push(user);
            }
            return source.call(this, ...outArgs);
        }
    }
}

function getParametersList(functionRepresentation: string, functionName: string): string[] {
    let functionParametersStart = functionRepresentation.indexOf(functionName) + functionName.length;
    functionParametersStart = functionRepresentation.indexOf('(', functionParametersStart);
    const functionParametersEnd = functionRepresentation.indexOf(')');
    const functionParameters = functionRepresentation.substring(functionParametersStart + 1, functionParametersEnd);
    return functionParameters.split(',').map(p => p.trim());
}