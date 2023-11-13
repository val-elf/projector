'use strict';

const previewSize = 75;
import { Readable } from 'stream';
import { Buffer } from 'buffer';
import Jimp from 'jimp';
import md5 from 'md5';
import { IInitPreviewed, IPreview, IPreviewed } from '~/backend/entities/models';
import * as sourceMap from 'source-map-support';

import colors from 'colors/safe';

const maxSize = (v1, v2) => {
	return v1 > v2;
}

class DataReadableStream extends Readable {
	private _sended: number = 0;

	constructor(public data) {
		super();
	}

	_read(size: number) {
		if(!this._sended) this.push(this.data);
		else this.push(null);
		this._sended = this.data.length;
	}
}

type Unpreviewed<T> = Omit<T, 'preview'>;

type Inited<T> = Unpreviewed<T> & Partial<IInitPreviewed>;

export const utils = {
	getStreamFromBuffer: function(buffer) {
		return new DataReadableStream(buffer);
	},
	preparePreview: async function<T extends Partial<IPreviewed>>(previewed: Inited<T>): Promise<T> {
		const { preview: _preview, ...origin } = previewed;
		const result: T = origin as unknown as T;
		if(_preview){
			var content = Buffer.from(_preview, 'base64');
			const img = await Jimp.read(content);//, function(err, img){
			const { width, height } = img.bitmap;
			const [maxDim, anoDim] = maxSize(width, height) ? ['height', 'width'] : ['width', 'height'];
			const preview = { width, height, hash: md5(_preview), preview: _preview } as IPreview;
			if(img.bitmap[maxDim] > previewSize) {
				const newDimenstions = {
					[anoDim]: Math.floor(img.bitmap[anoDim] / img.bitmap[maxDim] * previewSize),
					[maxDim]: previewSize
				};
				const buff = await img
					.resize(newDimenstions.width, newDimenstions.height)
					.getBufferAsync(Jimp.MIME_PNG);

				const { width, height } = img.bitmap;
				const pdata = buff.toString('base64');
				const hash = md5(pdata);
				Object.assign(preview, {
					preview: pdata,
					width,
					height,
					hash
				});
				return {
					...result,
					preview
				};

			} else {
				if(!preview.width || !preview.height){
					preview.width = img.bitmap.width;
					preview.height = img.bitmap.height;
				}
				return {
					...result,
					preview
				};
			}
		} else {
			return result;
		}
	}
}

const path = require('path');
const sourcePath = process.cwd();
const originalLog = console.log;

function eLog(logger: any, ...args: any[]) {

	let stackLine = (new Error).stack.split("\n")[3];

	const parts = stackLine.match(/^\s+at\s+(.*)\s+\((.*)\)$/);
	if (parts) {
		let destination = parts[1];
		if (destination.startsWith('Function.')) {
			destination = destination.replace(/^Function\./, 'static ');
		}
		const position = parts[2];

		const positionParts = position.match(/^(.*):(\d+):(\d+)$/);
		const fullFileName = positionParts[1];
		const lineNumber = positionParts[2];
		const columnNumber = positionParts[3];
		const fileName = path.basename(fullFileName);
		const message = `\n\x1b[20G\x1b]8;;file://${fullFileName.replace(/\\/g, '/')}\x1b\\${fileName}:${lineNumber}:${columnNumber}\x1b]8;;\x1b\\ (${destination}))`

		const currentLogHandler = console.log;
		try {
			console.log = originalLog;
			logger(...args, colors.gray(message));
		} finally {
			console.log = currentLogHandler;
		}
	} else logger(...args);
}

export function improveConsoleOutput() {

	colors.enable();
	sourceMap.install({
		environment: 'node',
	});

	console.clear = () => {
		require('child_process').execSync('cls', {stdio: 'inherit'});
	}

	['debug', 'log', 'warn', 'error', 'group', 'groupCollapsed', 'groupEnd'].forEach((methodName) => {
		const originalLoggingMethod = console[methodName];
		console[methodName] = (...args: any[]) => {
			eLog(originalLoggingMethod, ...args);
		}
	});
}