import { Express } from 'express';
import { configureApp } from '~/network';
import { generateDatabase } from './gendb';

const test = async () => {
    await generateDatabase();
}

export function configureTestEnvironment(app: Express) {
    configureApp(app, true, false, 'projector-test', 7000);
}

export async function runUnitTests() {
	return await test();
}

