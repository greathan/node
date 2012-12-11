var connect = require('connect'),
	http = require('http'),
	https = require('https'),
	url = require('url'),
	fs = require('fs');

require('./config');

var port = global.PORT;

console.log(port);
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

		var param = url.parse(req.url, true).query;

		var addr = 'http://zx.bjmemc.com.cn/pm25/Charts/CreateTableV.aspx?place=wl';

		http.request({
			host: "zx.bjmemc.com.cn",
			path: "/pm25/Charts/CreateTableV.aspx?place=wl",
			port: "80",
			method: "GET"
		}, function(r) {
			r.on('data', function(chunk) {

				var arr = chunk.toString().split('<tr>');
				var reg = /<td style="color:Black;">(\d{1,2}).+\s(\d{2}:\d{2})<\/td><td>([\.\d]+)<\/td><td>([\.\d]+)<\/td><td>([\.\d]+)<\/td>/;
				var result  = [];
				for (var i = 0, l = arr.length; i < l; i++) {
					var item = arr[i].match(reg);
					item && item.shift() && result.push(item);
					
				}

				var list = [];
				result.forEach(function(item) {
					list.push({
						day: item[0],
						time: item[1],
						SO2: item[2],
						NO2: item[3],
						PM25: item[4]
					});
				});

				var data = {
					apiVersion: "1.0",
					data: {
						"position": "39.9768,116.2990",
						"items": list
					}
				};

				res.setHeader('Content-Type', 'application/json');
				var jsonString = JSON.stringify(data);
				res.write(param.callback ? (param.callback + '(' + jsonString + ')') : jsonString);
				res.end();
			});
		}).end();

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
	.listen(port);