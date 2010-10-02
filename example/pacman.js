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

function initializeSocket() {
  var socket = new io.Socket(null, {port: 8080});
  socket.connect();
  socket.on('message', function(obj){
    console.log(obj);
    if (x in obj && y in obj) {
      var index = (obj.y-1)*5 + (obj.x);
      $("#maze"+index).css("background-image", "url('http://cdn.siong1987.com/pacman/maze.png'");
    }
  });
}

