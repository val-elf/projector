const ChildProcess = require('child_process');
const config = require('@root/config');
const exifname = config['exiftool'] || 'exiftool';

class Exif {
	getCCKey(key) {
		const isLower = char => char.toLowerCase() === char;

		let findSecond = false;
		return key.split('')
			.map((char, index) => {
				if (findSecond) return char;
				if (index === 0) return char.toLowerCase();
				if (isLower(char)) {
					findSecond = true;
					return char;
				}
				const nchar = key[index + 1];
				if (nchar && isLower(nchar)) {
					findSecond = true;
					return char;
				}
				return char.toLowerCase();
			})
			.join('');
	}

	async metadata(source) {
		// tags is an optional parameter, hence it may be a callback instead.
		return new Promise((resolve, reject) => {
			const exif = ChildProcess.exec(`${exifname} - -j -z`, { stdio: ['pipe', 'pipe', 'pipe', 'pipe'] });
			exif.stdin.write(source);
			exif.stdin.end();

			exif.on('error', err => {
				console.error("Error while start exiftool", err);
				reject(err);
			});

			let response = '';
			exif.stdout.on("data", data => {
				response += data;
			});

			exif.stdout.on('end', () => {
				const res = JSON.parse(response)[0];
				const metadata = Object.keys(res).reduce((out, key) => {
					out[this.getCCKey(key)] = res[key];
					return out;
				}, {});
				resolve(metadata);
			})
		});
	}
}

// Accepts the raw binary content of a file and returns the meta data of the file.
module.exports = new Exif();
