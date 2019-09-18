const mammothTranscoder = require('mammoth');
const fs = require('fs');
const md5 = require('md5');
const child = require('child_process');
const Jimp = require('jimp');

class DocumentTranscoder {
    static async translateTo(sourceFile, tid, format) {
        format = format || 'pdf';
        const out = `./storage/tmp/${tid}.${format}`;

        return new Promise((resolve, reject) => {
            try {
                child.execSync(`unoconv -f ${format} --output=${out} ${sourceFile}`, { encoding: 'buffer' });
                const result = fs.readFileSync(out);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    static wordToHtml(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const trans = await mammothTranscoder.convertToHtml(data);
                resolve(trans.value);
            } catch (error) {
                reject(error);
            }
        });
    }

    static async thumbnail(tid, awaiter) {
        return new Promise(async (resolve, reject) => {
            const dmax = 150;
            try {
                await awaiter;
                const preview = await this.translateTo(`./storage/tmp/${tid}.pdf`, tid, 'png');
                const img = await Jimp.read(preview);
                let { width, height } = img.bitmap;
                if (width > height) {
                    height = Math.ceil(dmax * height / width);
                    width = dmax;
                } else {
                    width = Math.ceil(dmax * width / height);
                    height = dmax;
                }
                const result = await img
                    .resize(width, height)
                    .getBufferAsync(Jimp.MIME_PNG);

                resolve({
                    contentType: 'image/png',
                    value: result,
                    hash: md5(result),
                    ihash: img.hash(),
                    width: width,
                    height: height
                });
            } catch (err) { reject(err); }
        });
    }

    static transcode(data, options) {
        const { sourceFile, tid, isExcel, isWord } = options
        try {
            const pdf = this.translateTo(sourceFile, tid);
            const thumbnail = this.thumbnail(tid, pdf);
            const result = { pdf, thumbnail };
            if (isWord) result.html = this.wordToHtml(data);
            // else if(isExcel) result.html = this.translateTo(sourceFile, tid, 'html');
            return result;
        } catch (error) {
            console.error('Error while word-document transcoding', error);
        }
    }
}

module.exports = DocumentTranscoder;