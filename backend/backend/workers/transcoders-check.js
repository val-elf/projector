const config = require('../../config.js');
const md5 = require('md5');
const http = require('../../utils/simpleHttp');
const Files = require('../files');
const { transcoder } = config;



module.exports = {
    interval: 5000,
    run: async function(application) {
        const fileManager = Files.getInstance(application);
        let data;
        try {
            const url = `${transcoder}prepared`;
            data = await http.get(url);
        } catch (error) {
            console.log('Transcoder didn\'t started', error);
            return;
        }
        const items = JSON.parse(data);
        Object.keys(items).forEach(async tid => {
            const { exif, thumbnail } = items[tid];
            if (exif) {
                try {
                    await fileManager.updateFileByTranscode(tid, { exif }, true);
                    http.get(`${transcoder}processed-exif?tid=${tid}`);
                } catch (error) {
                    console.log('File with transcode id ', tid, 'did not find', error);
                };
            }
            if (thumbnail) {
                const preview = thumbnail.value.data;
                const hash = md5(preview);
                const { contentType, width, height} = thumbnail;
                await fileManager.updateFileByTranscode(tid, {
                    preview: {
                        type: contentType,
                        preview,
                        hash,
                        width,
                        height
                    }
                }, true);
                http.get(`${transcoder}processed-transcode?tid=${tid}&type=thumbnail`);
            }
        });
    }
}