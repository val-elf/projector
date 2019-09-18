module.exports = {
	apiPath: "/srv",
	apiFolder: "./server",
	port: 7003,
	dbLink: 'mongodb://127.0.0.1/projector',
	transcoder: 'http://127.0.0.1:7001/',
	myip: '127.0.0.1',
	dynamicUrls: ['/login', '/logout', '/settings', '/users', '/projects', '/tasks', '/file'],
	cachableContent: true,
	applicationPath: '../content/app',
	staticPath: '../content'
}