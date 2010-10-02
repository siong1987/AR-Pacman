var globalClient;

var http = require('http'), 
		url = require('url'),
		fs = require('fs'),
		io = require('../'),
		sys = require('sys'),
		
server = http.createServer(function(req, res){
	// your normal server code
	var path = url.parse(req.url).pathname;
	switch (path){
		case '/':
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write('<h1>Welcome. Try the <a href="/chat.html">chat</a> example.</h1>');
			res.end();
			break;
			
		case '/json.js':
		case '/socket.js':
    case '/pacman.js':
			fs.readFile(__dirname + path, function(err, data){
				if (err) return send404(res);
				res.writeHead(200, {'Content-Type': 'text/javascript'})
				res.write(data, 'utf8');
				res.end();
			});
			break;
			
    case '/pacman.css':
			fs.readFile(__dirname + path, function(err, data){
				if (err) return send404(res);
				res.writeHead(200, {'Content-Type': 'text/css'})
				res.write(data, 'utf8');
				res.end();
			});
			break;

		case '/chat.html':
			fs.readFile(__dirname + path, function(err, data){
				if (err) return send404(res);
				res.writeHead(200, {'Content-Type': 'text/html'})
				res.write(data, 'utf8');
				res.end();
			});
			break;
			
		default: send404(res);
	}
}),

send404 = function(res){
	res.writeHead(404);
	res.write('404');
	res.end();
};

server.listen(8080);
		
// socket.io, I choose you
// simplest chat application evar
var io = io.listen(server),
		globalClient;
		
io.on('connection', function(client){
  globalClient = client;

	client.on('message', function(message){
	});

	client.on('disconnect', function(){
	});
});

var net = require('net'),
	  map = [[3, 3, 3, 3, 3],
	         [3, 3, 3, 3, 3],
	         [3, 3, 3, 3, 3],
	         [3, 3, 3, 3, 3],
	         [3, 3, 3, 3, 3]],
	 monsters = [[0, 4], [1, 3]],
	 player = [2, 2],
	 wall = [[[0, 0], [0, 0], [0, 1], [0, 1], [0, 0]],
	         [[1, 0], [0, 1], [0, 1], [1, 0], [0, 0]],
	         [[1, 0], [0, 0], [0, 1], [1, 0], [0, 0]],
	         [[0, 1], [0, 0], [0, 0], [0, 1], [0, 0]],
	         [[0, 0], [1, 0], [0, 0], [0, 0], [0, 0]]];
	         
function mapJson(mapPara, monsters) {
  var tempMap = Array.new(mapPara);
  for (var i=0; i<monsters.length; i++) {
    tempMap[monsters[i][0]][monsters[i][1]] = 2;
  }
  
  console.log(tempMap);
  
  return "{\"map\":"+JSON.stringify(tempMap)+",\"wall\":"+JSON.stringify(wall)+"}\0";
};
	 
var iphone = net.createServer(function (stream) {
  stream.setEncoding('utf8');
  stream.write("{\"message\":\"yo!\"}");
  stream.on('connect', function () {
  });
  
  setInterval(function () {
    for (var i=0; i<monsters.length; i++) {
      monsters[i][0]++;
    }
    stream.write(mapJson(map, monsters));
  }, 1000);
  
  stream.on('data', function (data) {
    var json_data = JSON.parse(data);
    if (json_data.type == 1) {
      globalClient.send(data);
      if (map[json_data.y][json_data.x] == 3)
        map[json_data.y][json_data.x] = 0;
      stream.write(mapJson(map, monsters));
    }
    
    stream.write(mapJson(map, monsters));
  });
  stream.on('end', function () {
    stream.write('goodbye\r\n');
    stream.end();
  });
});
iphone.listen(8124);

