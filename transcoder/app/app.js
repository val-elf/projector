const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const fs = require('fs');
const exif = require('./tools/exif-tool');
const transcoder = require('./tools/transcoder-tool');
const mongo = require('mongodb');
const objId = mongo.ObjectID;
const baseStorage = './storage/';

class App {

    constructor() {
        this.queueStorage = `${baseStorage}queue/`;
        this.sourcesStorage = `${baseStorage}sources/`;
        this.thumbsStorage = `${baseStorage}thumbnails/`;
        this.transcodedStorage = `${baseStorage}transcoded/`;
        this.exifDataPath = `${baseStorage}exifData.json`;
        this.progress = {};
    }

    getExifData(tid, response) {
        const exifData = this.exifData[tid];
        response.write(exifData ? JSON.stringify(exifData) : undefined);
        response.end();
    }

    getPreviewData(tid, response) {
        let preview;
        try {
            preview = fs.readFileSync(`${this.thumbsStorage}${tid}`);
        } catch (err) {
            console.error('err', err);
            response.write('{}');
            response.end();
            return;
        }
        const data = {
            preview: preview.toString('base64')
        };
        try{
            const loaded = JSON.parse(fs.readFileSync(`${this.thumbsStorage}${tid}.json`));
            Object.assign(data, loaded);
        } catch (err) {}
        response.write(JSON.stringify(data));
        response.end();
    }

    getTranscodingResult(tid, response) {
        const data = fs.readFileSync(`${this.transcodedStorage}${tid}`);
        response.write(data);
        response.end();
    }

    getSource(tid, response) {
        const data = fs.readFileSync(`${this.sourcesStorage}${tid}`);
        response.write(data);
        response.end();
    }

    checkActualStateFor(tid, status) {
        if (!this.progress[tid]) {
            if (fs.existsSync(`${this.transcodedStorage}${tid}`)) {
                Object.assign(status, {
                   status: 'finished'
                });
            } else {
                Object.assign(status, {
                    status: 'lost',
                    tid
                });
            }
            this.syncStatus(tid, status);
        }
    }

    getTranscodingStatus(tid, response) {
        let status = this.progress[tid];
        const fname = `${this.queueStorage}${tid}.json`;
        if (!status) {
            if (fs.existsSync(fname)) {
                status = JSON.parse(fs.readFileSync(fname));
            } else {
                status = {
                    status: 'unknown',
                    tid
                };
            }
        }

        if (status && status.status) {
            const statValue = status.status;
            if (statValue === 'transcode' || statValue === 'unknown') {
                this.checkActualStateFor(tid, status);
            }
        }

        response.write(JSON.stringify(status));
        response.end();
    }

    errHandle(err) {
        if (err) console.error(err);
    }

    storeTranscodeResult(tid, type, result) {
        let path = this.transcodedStorage;
        let ext = '';
        let fileContent = result;
        const jsonData = {};
        console.log('Storing transcoded result', type, result.length);
        switch (type) {
            case 'thumbnail':
                path = this.thumbsStorage;
                fileContent = result.value;
                delete result.value;
                Object.assign(jsonData, result);
                break;
            case 'html':
                ext = '.html'
                break;
        }
        const fname = `${path}${tid}${ext}`;
        fs.writeFile(fname, fileContent, this.errHandle);
        if (Object.keys(jsonData).length)
            fs.writeFile(`${fname}.json`, JSON.stringify(jsonData), this.errHandle);
    }

    currentStatus(tid) {
        let status = this.progress[tid];
        if (!status) {
            const fname = `${this.queueStorage}${tid}.json`;
            if (fs.existsSync(fname)) {
                status = fs.readFileSync(fname);
            } else {
                status = { status: 'unknown' };
            }
        }
        return status;
    }

    setStatusFor(tid, status) {
        const cstatus = this.currentStatus(tid);
        let st = status;
        if (typeof(status) === 'string') st = { status };
        Object.assign(cstatus, st);
        this.progress[tid] = cstatus;
        this.syncStatus(tid, cstatus);
    }

    syncStatus(tid, status) {
        fs.writeFileSync(`${this.queueStorage}${tid}.json`, JSON.stringify(status));
    }

    async processTask(tid, data, response) {
        console.log("Metadata getting task started for ", tid);
        this.setStatusFor(tid, 'new');
        try {
            const sourceFile = `${this.sourcesStorage}${tid}`;
            fs.writeFile(sourceFile, data, err => {
                if (err) {
                    console.error(`Error while tryin to save original file for ${tid} transaction`);
                }
            });
            const exifResult = await exif.getMetadata(data);
            this.exifData[tid] = exifResult;
            this.syncExifData();
            this.setStatusFor(tid, {
                status: 'exif',
                exif: 'ready'
            });
            const transcodeResult = transcoder.process(data, {
                exif: exifResult,
                format: 'mp4',
                videoCodec: 'theora',
                audioCodec: 'vorbis',
                sourceFile,
                tid,
                image: {
                    width: 150,
                    height: 150
                },
                onProgress: progress => this.setStatusFor(tid, { progress } )
            });
            this.setStatusFor(tid, 'transcode');
            const transcodes = Object.keys(transcodeResult || {});
            (async () => {
                await Promise.all(transcodes.map(async transType => {
                    try {
                        const result = await transcodeResult[transType];
                        if (transType === 'thumbnail') {
                            this.setStatusFor(tid, { preview: 'ready' });
                        }
                        this.storeTranscodeResult(tid, transType, result);
                    } catch (err) {
                        console.error('Error while trying get transcode result for', transType, tid);
                        console.error(err);
                        this.setStatusFor(tid, { [transType]: 'fault' });
                    }
                }));
                this.setStatusFor(tid, 'finished');
            })();
        } catch (error) {
            console.error("Error", error);
        }
        response.end(JSON.stringify({ done: true, id: tid }));
    }

    runTranscoding(request, response) {
        response.setHeader('Content-Type', 'application/json');

        const tid = new objId(); // '56ab8537e7dc237468bee586'
        const data = [];
        request
            .on('data', chunk => {
                data.push(chunk);
            })
            .on('end', () => this.processTask(tid, Buffer.concat(data), response));

    }

    async prepareInfrastructure() {
        // create base storage
        if (!fs.existsSync(baseStorage)) {
            fs.mkdirSync(baseStorage);
        }
        ['queue', 'sources', 'thumbs', 'transcoded'].forEach(item => {
            const dir = `${item}Storage`;
            if (!fs.existsSync(this[dir])) {
                fs.mkdirSync(this[dir]);
            }
        });

        if (!fs.existsSync(this.exifDataPath)) {
            this.exifData = {};
            this.syncExifData();
        } else this.exifData = JSON.parse(fs.readFileSync(this.exifDataPath));
    }

    async syncExifData() {
        fs.writeFile(this.exifDataPath, JSON.stringify(this.exifData), (err) => {
            if (err) console.error('Error while syncing exif storage', err);
        });
    }

    async run(config) {
        app.use(cookieParser());
        console.log("start application at port %s", config.port);

        app.use('/', express.Router()
            .post('', (req, res) => this.runTranscoding(req, res))
            .get('/exif-data/', (req, res) => this.getExifData(req.query.tid, res))
            .get('/preview-data', (req, res) => this.getPreviewData(req.query.tid, res))
            .get('/source-data', (req, res) => this.getSource(req.query.tid, res))
            .get('/transcoding-data', (req, res) => this.getTranscodingResult(req.query.tid, res))
            .get('/status', (req, res) => this.getTranscodingStatus(req.query.tid, res))
        );

        await this.prepareInfrastructure();

        app.listen(config.port);
    }
}


module.exports = new App();


