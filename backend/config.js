const local = require('./config.local') || {};

const config = Object.assign({
	apiPath: "/",
	apiFolder: "server",
	port: 6001,
	dbLink: 'mongodb://127.0.0.1/projector',
	transcoder: 'http://127.0.0.1:7001/',
}, local);

module.exports = config;