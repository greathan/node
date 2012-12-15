var http = require('http'),
	url = require('url');


/**
 * Air Quaility
 *
 */
var Air = (function() {

	return {

		init: function(req, res) {

			var param = url.parse(req.url, true).query;

			var opts = {
				host: "zx.bjmemc.com.cn",
				path: "/pm25/Charts/CreateTableV.aspx?place=wl",
				port: "80",
				method: "GET"
			};

			//var self = this;
			http.request(opts, function(r) {
				r.on('data', function(chunk) {

					var data = Air.parse(chunk);

					res.setHeader('Content-Type', 'application/json');
					var jsonString = JSON.stringify(data);
					res.write(param.callback ? (param.callback + '(' + jsonString + ')') : jsonString);
					res.end();
				});
			}).end();
			
		},

		parse: function(data) {
			var arr = data.toString().split('<tr>');
			var reg = /<td style="color:Black;">(\d{1,2}).+\s(\d{2}:\d{2})<\/td><td>([\.\d]+)<\/td><td>([\.\d]+)<\/td><td>([\.\d]+)<\/td>/;
			var result  = [];
			for (var i = 0, l = arr.length; i < l; i++) {
				var item = arr[i].match(reg);
				item && item.shift() && result.push(item);
				
			}

			var list = [];
			result.forEach(function(item) {
				item[0] == new Date().getDate() && list.push({
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
			return data;
		}
	};
})();

exports.init = Air.init;
