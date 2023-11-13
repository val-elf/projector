import md5 from 'md5';
import { Request } from '~/network';

export const isString = (obj: any) => typeof(obj) === "string";
export const isArray = (obj: any) => Array.isArray(obj);
export const isObject = (obj: any) => typeof(obj) === "object";

export const prepareHash = doc => {
	const { _updated, _created, __v, ...clean} = doc;
	return md5(JSON.stringify(clean));
};

const AUTH_HEADER = 'authorization';

export function getToken(request: Request) {
	const isAuth = request.headers[AUTH_HEADER] || null;
	return isAuth;
}