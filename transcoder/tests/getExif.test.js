var http = require("../utils/simpleHttp"),
	config = require("../config"),
	fs = require('fs'),
	express = require('express'),
	exif = require('exiftool'),
	process =require('process'),
	q = require('node-promise'),
	files = [
		'Креативная реклама Mustang 2013 - Creative ads New 2013 Mustang.mp4',
		'Не для ТВ! Полная версия рекламы Lipton Ice Tea Пощёчина.mp4',
		'Реклама BMW с Мадонной и Клайвом Оуэном (полная версия) .mp4',
		'Samsung LED «C» (The Viral Factory).flv',
		'reklama_skitls_quotmolodozhyony.flv',
		'Official PlayStation 4 Perfect Day Commercial.mp4',
		'12631406_632993576841463_4380305999032555814_n.jpg',
		'40dc1b1eb2d927db9081bde92f839ed5.jpg',
		'RFA Phase II_RFA02_03_16816_V1.3.docx'
	],
	findex = process.argv[2]!==undefined ? parseInt(process.argv[2]) : 4,
	fname = './files/' + files[findex],
	app = express(),
	ophost = 'http://' + config.host + ':' + config.port + '/',
	srv
;


function createQueue(){
	var promise = q.Promise(),
		readyForExif = q.Promise();
	app.use('/srv', express.Router()
		.post('/exif-results/', function(req, res, next){
			var dt = "";
			req.on('data', function(data){
				dt+= data.toString('utf8');
			});
			req.on('end', function(){
				console.log("DATA on exif result = ", JSON.parse(dt));
				readyForExif.resolve();
				res.write(JSON.stringify({done: true}));
				res.end();
			})
		})
		.post('/transcode-results/', function(req, res, next){
			var dt = 0;
			console.log("HDRS", req.headers);
			req.on('data', function(data){ 
				dt += data.length;
			});
			req.on('end', function(){
				console.log("Data on transcode-results size", req.query, dt);
				res.end();
			})
		})
	);

	fs.readFile(fname, function(err, data){
		srv = app.listen(7004, '127.0.0.1');
		http.post(ophost + '?callback=127.0.0.1:7004', data, function(data){
			var res = JSON.parse(data.toString());
			console.log("DC", res);
			res.readyForExif = readyForExif;
			promise.resolve(res);
		});
	});
	return promise;
}

function getExifDataFor(fid){
	http.get(ophost + 'exif-data/?id='+fid, function(data){
		var res = JSON.parse(data.toString());
		console.log("EXIF for %s", fid, res);
	})
}


createQueue().then(function(result){
	var fid = result.id;
	q.when(result.readyForExif, function(){
		getExifDataFor(fid);
	});
});
