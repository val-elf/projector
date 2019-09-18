const local = require('./config.local') || {};

const config = Object.assign({
	apiUrl: "srv/",
	backApi: 'http://localhost:6001/',
	port: 7000,
	cachableContent: true,
	staticPath: './'
}, local);

module.exports = config;