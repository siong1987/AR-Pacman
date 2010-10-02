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

function clone_obj(obj) {
  if (typeof obj !== 'object' || obj == null) {
    return obj;
  }
 
  var c = obj instanceof Array ? [] : {};
 
  for (var i in obj) {
    var prop = obj[i];
 
    if (typeof prop == 'object') {
      if (prop instanceof Array) {
        c[i] = [];
 
        for (var j = 0; j < prop.length; j++) {
          if (typeof prop[j] != 'object') {
            c[i].push(prop[j]);
          } else {
            c[i].push(clone_obj(prop[j]));
          }
        }
      } else {
        c[i] = clone_obj(prop);
      }
    } else {
      c[i] = prop;
    }
  }
 
  return c;
};

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
  var tempMap = clone_obj(mapPara);
  for (var i=0; i<monsters.length; i++) {
    tempMap[monsters[i][0]][monsters[i][1]] = 2;
  }
  tempMap[player[0]][player[1]] = 1;
  
  console.log(tempMap);
  
  return "{\"map\":"+JSON.stringify(tempMap)+",\"wall\":"+JSON.stringify(wall)+"}\0";
};

function sgn(x) {
  if (x>0)
    return 1;
  else if(x<0)
    return -1;
  return 0;
}

function canwalk(x, y, dx, dy) {
  var x2 = x+dx, y2 = y+dy;
  if (x2<0 ||  x2>=5 || y2<0 || y2>=5)
    return false;
  if (dx < 0)
    return !wall[y][x-1][0];
  if (dx > 0)
    return !wall[y][x][0];
  if (dy < 0)
    return !wall[y-1][x][1];
  if (dy > 0)
    return !wall[y][x][1];
  return true;
}

var interval;
	 
var iphone = net.createServer(function (stream) {
  stream.setEncoding('utf8');
  stream.write("{\"message\":\"yo!\"}");
  stream.on('connect', function () {
  });
  
  interval = setInterval(function () {
    for (var i=0; i<monsters.length; i++) {
      //monsters[i][0]++;
      var tries = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      var x = monsters[i][1], y = monsters[i][0];
      var dx = sgn(player[1]-monsters[i][1]);
      var dy = sgn(player[0]-monsters[i][0]);
      
      if (dx == 0 || dy == 0) {
        tries.push([dy, dx]);
      } else {
        tries.push([dy, 0]);
        tries.push([0, dx]);
      }
      
      for (var j=tries.length-1; j>=0; j--) {
        if (canwalk(x, y, tries[j][1], tries[j][0])) {
          x += tries[j][1]; y += tries[j][0];
          break;
        }
      }
      
      monsters[i][1] = x;
      monsters[i][0] = y;
    }
    stream.write(mapJson(map, monsters));
  }, 1000);
  
  stream.on('data', function (data) {
    var json_data = JSON.parse(data);
    if (json_data.type == 1) {
      player[1] = json_data.x;
      player[0] = json_data.y;
      
      if (globalClient) globalClient.send(data);
      
      if (map[json_data.y][json_data.x] == 3)
        map[json_data.y][json_data.x] = 0;
      stream.write(mapJson(map, monsters));
    }
    
    stream.write(mapJson(map, monsters));
  });
  stream.on('end', function () {
    if(interval) {
      clearInterval(interval);
    }
    stream.write('goodbye\r\n');
    stream.end();
  });
});
iphone.listen(8124);

