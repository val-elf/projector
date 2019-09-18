const fs = require("fs");
const extend = require('extend');
const conf = {
	port: 7001,
	host: '0.0.0.0'
};

if(fs.existsSync('config.local.js')){
	var dt = require('./config.local.js');
	Object.assign(conf, dt);
}

module.exports = conf;