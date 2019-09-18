//now we will begin transcode. This... is the Braavos's transcode

require('module-alias/register');
const app = require('./app/app');
const config = require('./config');

app.run(config);
