import md5 from "md5";
import { mongo } from 'mongoose';

export const objId = mongo.ObjectID;

export const isString = (obj: any) => typeof(obj) === "string";
export const isArray = (obj: any) => Array.isArray(obj);
export const isObject = (obj: any) => typeof(obj) === "object";

export const prepareHash = doc => {
	const clean = Object.assign({}, doc);
	delete clean._update;
	delete clean._create;
	delete clean.__v;
	return md5(JSON.stringify(clean));
};
