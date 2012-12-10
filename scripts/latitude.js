(function($, M) {

	var param = location.hash.split('#')[1];
	param = param.split('&');
	var p = {};
	$.each(param, function(i, item) {
		var el = item.split('=');
		p[el[0]] = el[1];
	});

	var url = 'https://www.googleapis.com/latitude/v1/location?callback=?';
	
	var map = new M.Map($('#map').get(0), {
		zoom: 12,
		center: new M.LatLng(39.921, 116.350),
		mapTypeId: M.MapTypeId.ROADMAP
	});
	addControl(map);

	function initMap(res) {

		var data = res.data.items;

		var r = [];
		var markers = {};
		var points = [];

		var latitudes = [],
			longitudes = [];


		for (var i = 0, l = data.length; i < l; i++) {
			var item = data[i],
				timestamp = item.timestampMs;
			latitudes.push(item.latitude);
			longitudes.push(item.longitude);
			var point = new M.LatLng(item.latitude, item.longitude);
			points.push(point);

			// var mkr = new M.Marker({
			// 	position: point,
			// 	map: map
			// });
			// markers[timestamp] = mkr;
			// markers[timestamp].timestamp = timestamp;
			// M.event.addListener(mkr, 'click', function() {
			// 	deletePoint(mkr);
			// });

			var date = new Date(parseInt(timestamp, 10));
			r.push('<a href="#' + timestamp +
				'" data-timestamp="' + timestamp + '">' +
				date.getHours().toString().replace(/^(\d)$/, '0$1') + ':' +
				date.getMinutes().toString().replace(/^(\d)$/, '0$1') + '</a>');
		}
		var max_lat = Math.max.apply(null, latitudes),
			min_lat = Math.min.apply(null, latitudes),
			max_lng = Math.max.apply(null, longitudes),
			min_lng = Math.min.apply(null, longitudes);

		map.fitBounds(new M.LatLngBounds(new M.LatLng(min_lat, min_lng),
			new M.LatLng(max_lat, max_lng)));

		var path = new M.Polyline({
			path: points,
			strokeColor: "#0000FF",
			strokeOpacity: 0.6,
			strokeWeight: 5
		});
		console.log(points.length);
		//path.setMap(map);
		var heatmap = new google.maps.visualization.HeatmapLayer({
  			data: points
		});
		
		heatmap.setMap(map);

		heatmap.setOptions({
			radius: 10,
			opacity: 0.8
		})

		var info = new M.InfoWindow();
/*
		var geocoder = new M.Geocoder();
		$('#list').html(r.join(' ')).delegate('a', 'mouseover', function() {
			var mkr = markers[$(this).data('timestamp')];
			map.panTo(mkr.getPosition());

			var date = new Date(parseInt(mkr.timestamp, 10));

			info.setContent('Latitude:' + item.latitude +
					'<br />Longitude:' + item.longitude +
					'<br />Time:' + date.toTimeString());
			info.setPosition(mkr.getPosition());
			info.open(map, mkr);

			geocoder.geocode({'latLng': mkr.getPosition()}, function(results, status) {
		      if (status == google.maps.GeocoderStatus.OK) {
		        if (results[0]) {
		        	info.setContent('Latitude:' + item.latitude +
					'<br />Longitude:' + item.longitude +
					'<br />Time:' + date.toTimeString() + '<br />' +
					results[0].formatted_address);
					info.setPosition(mkr.getPosition());
					info.open(map, mkr);
				}
		      } else {
		        alert("Geocoder failed due to: " + status);
		      }
		    });
			
		}).delegate('a', 'click', function(e) {
			var timestamp = $(this).data('timestamp');
			var mkr = markers[timestamp];

			deletePoint(mkr);

			e.preventDefault();
		});*/
	}

	function deletePoint(mkr) {
		var b = confirm('confirm to delete this point?');
		if (b) {
			$.ajax({
				url: "/delete?callback=?",
				type: "GET",
				dataType: "jsonp",
				data: {
					"location": mkr.timestamp,
					"access_token": p.access_token,
					"key": "AIzaSyDyChzBw2v3uVsxNwu_EcvPHXMluYsK79w"
				},
				success: function(res) {
					if (res.res == 'ok') {
						mkr.setMap(null);
						$('[data-timestamp=' + mkr.timestamp + ']').remove();
					} else {
						alert('failed');
					}
				}
			});
		}
	}

	function addControl(map) {
		var div = $($('#tpl').val());
		div.find('[name=access_token]').val(p.access_token);
		var from = new Date();
		from.setDate(from.getDate() - 1);
		div.find('#to').val(new Date().toString());
		div.find('#from').val(from.toString());
		div.addClass('search-control').submit(function() {
			$(this).find('[name=max-time]').val(new Date($('#to').val()).getTime());
			$(this).find('[name=min-time]').val(new Date($('#from').val()).getTime());

			$.ajax({
				url: url,
				data: $('form').serialize(),
				dataType: 'jsonp',
				success: function(res) {
					initMap(res);
				}
			});

			return false;

		});
		div.get(0).index = 1;
		map.controls[M.ControlPosition.TOP_LEFT].push(div.get(0));

	}

})(jQuery, google.maps);