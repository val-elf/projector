import { localConfig } from "./config.local";

export const config = Object.assign({
	apiPath: "/",
	apiFolder: "server",
	port: 6001,
	dbHost: '127.0.0.1',
	database: 'projector',
	transcoder: 'http://127.0.0.1:7001/',
}, localConfig);
