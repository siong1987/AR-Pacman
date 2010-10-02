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
	  map = [[3, 3, 3, 2, 3],
	         [3, 3, 2, 3, 3],
	         [3, 2, 3, 3, 3],
	         [3, 3, 3, 3, 2],
	         [3, 3, 3, 3, 3]],
	 wall = [[[1, 0], [0, 0], [0, 1], [0, 1], [0, 0]],
	         [[1, 0], [0, 1], [0, 1], [1, 0], [0, 0]],
	         [[1, 0], [0, 0], [0, 1], [1, 0], [0, 0]],
	         [[0, 1], [1, 0], [0, 0], [0, 1], [0, 0]],
	         [[0, 0], [1, 0], [0, 0], [0, 0], [0, 0]]];
	 
var iphone = net.createServer(function (stream) {
  stream.setEncoding('utf8');
  stream.write("{\"message\":\"yo!\"}");
  stream.on('connect', function () {
  });
  stream.on('data', function (data) {
    console.log(data["type"]);
    if (data["type"] == 1) {
      console.log(data);
      if (globalClient) globalClient.send(data);
    }
    
    stream.write("{\"map\":"+JSON.stringify(map)+",\"wall\":"+JSON.stringify(wall)+"}\0");
  });
  stream.on('end', function () {
    stream.write('goodbye\r\n');
    stream.end();
  });
});
iphone.listen(8124);

