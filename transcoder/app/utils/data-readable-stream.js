const stream = require('stream');

class DataReadableStream extends stream.Readable {
	constructor(data) {
		super();
		this.data = data;
		this._sended = 0;
	}

	_read(size) {
		if(!this._sended) this.push(this.data);
		else this.push(null);
		this._sended = this.data.length;
	}
}

module.exports = DataReadableStream;