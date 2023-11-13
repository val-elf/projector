//generate database by client

import { core } from "./core";
import { generators } from './generation-scripts';

let sessionId, user;

export const generateDatabase = async () => {
	/*const userData = await core.post(
		'/srv/:login',
		{ login: 'login' }, { login: 'test', password: 'test' }
	)
	sessionId = userData._id;
	user = userData.user;

	core.setAuthToken(sessionId);*/

	/* generate projects */
	for await (let generator of getGenerators()) { }
	console.log("\n\nGeneration of the DATABASE is finished!");
};

async function *getGenerators() {
	for(let g of generators) {
		const generator = new g();
		yield *generator.generate();
	}
}


process.on('uncaughtException', (err) => {
	console.log("ERR caught", err);
});
