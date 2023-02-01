//generate database by client

import { utils } from './utils';
import { core } from "./core";

let sessionId, user;

(async () => {
	const userData = await core.post(
		'/srv/:login',
		{ login: 'login' }, { login: 'test', password: 'test' }
	)
	sessionId = userData._id;
	user = userData.user;

	core.setCookie("_session", sessionId);

	/* generate projects */
	await Promise.all(generateProjects());
	console.log("Generation projects ends");
})();

function generateProjects(): Promise<any>[]{
	let i = 0;
	const run = async (last?) => {
		if(i > 10) return last;

		i++;

		const a = utils.genPhrase(1, 3, 20, true);
		const projects = await core.post('/srv/projects', {}, { name: a });
		return run(projects);
	}

	return [run()];
}


process.on('uncaughtException', (err) => {
	console.log("ERR caught", err);
});
