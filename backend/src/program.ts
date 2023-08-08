import { Express } from "express";
import { configureApp } from './network';

const isDev = process.env.NODE_ENV === 'development' || process.argv.indexOf('--dev') > 0;

export function runExpress(app: Express) {
	configureApp(app, isDev, true)
}
