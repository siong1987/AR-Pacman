var map;

$(document).ready(function() {
  initializeMap(document.getElementById("map_canvas"));
  initializeSocket();
});

function initializeMap(map_canvas) {
  var myLatlng = new google.maps.LatLng(40.11176, -88.22704);
  var myOptions = {
    zoom: 20,
    center: myLatlng,
    disableDoubleClickZoom: false,
    navigationControl: false,
    scrollwheel: false,
    draggable: false,
    mapTypeControl: false,
    disableDoubleClickZoom: false,
    mapTypeId: google.maps.MapTypeId.SATELLITE,
  }
  map = new google.maps.Map(map_canvas, myOptions);
}

function drawMap(json_object) {
  var canvas = document.getElementById("maze");  
  var ctx = canvas.getContext("2d");  
  ctx.clearRect(0,0,800,800);
  
  ctx.fillStyle = "rgb(80,80,80)";
  ctx.fillRect(0, 0, 800, 8);
  ctx.fillRect(0, 792, 800, 8);
  ctx.fillRect(0, 0, 8, 800);
  ctx.fillRect(792, 0, 8, 800);

  for(i=0;i<5;i++) {
    for(j=0;j<5;j++) {
      point = json_object.map[i][j];

      if (point == 0) {
        
      } else if (point == 1) {
        ctx.drawImage(document.getElementById('pacman'),30+j*160,30+i*160, 100, 100);
      } else if (point == 2) {
        ctx.drawImage(document.getElementById('monster'),30+j*160,30+i*160, 100, 100);
      } else if (point == 3) {
        ctx.drawImage(document.getElementById('source'),30+j*160,30+i*160, 100, 100);
      }
      
      ctx.fillStyle = "rgb(80,80,80)";
      wall = json_object.wall[i][j];
      if (wall[0] == 1) {
        ctx.fillRect(152+j*160, i*160, 16, 160);
      }
      
      if (wall[1] == 1) {
        ctx.fillRect(j*160, 152+i*160, 160, 16);
      }
    }
  }
}

function initializeSocket() {
  var socket = new io.Socket(null, {port: 8080});
  socket.connect();
  socket.on('message', function(obj){
    var json_data = JSON.parse(obj);
    if (json_data.coor1 && json_data.coor2) {
      var myLatlng = new google.maps.LatLng((json_data.coor1.latitude + json_data.coor2.latitude)/2, (json_data.coor1.longitude + json_data.coor2.longitude)/2);
      map.setCenter(myLatlng);
    }
    
    if (json_data.type == 2)
      drawMap(json_data);
  });
}

