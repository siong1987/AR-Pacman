$(document).ready(function() {
  initializeMap(document.getElementById("map_canvas"));
  initializeSocket();
});

function initializeMap(map_canvas) {
  var myLatlng = new google.maps.LatLng(40.11176, -88.22704);
  var myOptions = {
    zoom: 21,
    center: myLatlng,
    disableDoubleClickZoom: false,
    navigationControl: false,
    scrollwheel: false,
    draggable: false,
    mapTypeControl: false,
    disableDoubleClickZoom: false,
    mapTypeId: google.maps.MapTypeId.SATELLITE,
  }
  var map = new google.maps.Map(map_canvas, myOptions);
}

function drawMap(json_object) {
  var canvas = document.getElementById("maze");  
  var ctx = canvas.getContext("2d");  
  ctx.clearRect(0,0,800,800);

  for(i=0;i<5;i++) {
    for(j=0;j<5;j++) {
      point = json_object.map[i][j];

      if (point == 0) {
        
      } else if (point == 1) {
        ctx.fillStyle = "rgba(200,0,0,0.5)";
        ctx.fillRect(10+j*160, 10+i*160, 140, 140);
      } else if (point == 2) {
        ctx.fillStyle = "rgba(0,0,200,0.5)";
        ctx.fillRect(10+j*160, 10+i*160, 140, 140);
      } else if (point == 3) {
        ctx.fillStyle = "rgba(0,200,0,0.5)";
        ctx.fillRect(10+j*160, 10+i*160, 140, 140);
      }
    }
  }
}

function initializeSocket() {
  var socket = new io.Socket(null, {port: 8080});
  socket.connect();
  socket.on('message', function(obj){
    var json_data = JSON.parse(obj);
    console.log(json_data);
    drawMap(json_data);
  });
}

