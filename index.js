var connect = require('connect'),
	net = require('net'),
	os = require('os'),
	http = require('http'),
	https = require('https'),
	url = require('url'),
	fs = require('fs');

var air = require('./lib/air');

var config = require('./config');

var port = config.port;

var  app = connect()
	.use(connect.logger('dev'))
	.use(connect.static(__dirname + '/pages'))
	.use('/scripts', connect.static(__dirname + '/scripts'))
	.use('/styles', connect.static(__dirname + '/styles'))
	.use('/images', connect.static(__dirname + '/images'))


	.use('/delete', function(req, res) {
		var param = url.parse(req.url, true).query;
		//console.log(param);

		var options = {
			host: 'www.googleapis.com',
			path: '/latitude/v1/location/' + param.location + '?access_token=' + param.access_token + '&key=' + param.key,		  
			port: '443',
			method: 'DELETE'
		};

		callback = function(response) {
			//console.log(JSON.stringify(response.headers));
			
			var str = response.statusCode == 204 ? 'ok' : 'err';

			response.on('end', function() {
				res.end((param.callback || '') + '({ "res": ' + str + '})');
			});
		}

		https.request(options, callback).end();
	})
	.use('/air', function(req, res) {		

		var addr = 'http://zx.bjmemc.com.cn/pm25/Charts/CreateTableV.aspx?place=wl';
		air.init(req, res);


	})
	//.use(connect.directory(__dirname))
	// .use(function(req, res) {
	// 	//connect.directory(__dirname);
	// 	//console.log('req', req);
	// 	//console.log('res', res);
	// 	//console.log(global.PORT);

	// 	var url_parts = url.parse(req.url, true);
	// 	var query = url_parts.query;
	// 	fs.readFile(__dirname + '/index.html', function(err, data) {
	// 		res.setHeader('Content-Type', 'text/html');
	// 		res.end(data + '\n');
	// 	})

		
	// 	fs.readFile(__dirname + req.url, function(err, data) {
	// 		res.end(data + '\n');
	// 	})
	// 	//res.end(req.url + '\n');
	// })
	.listen(port, function() {
		console.log('the server is running at \033[01;35m' + os.hostname() + ':' + port);
	});
