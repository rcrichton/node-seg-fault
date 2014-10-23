https = require('https');
fs = require('fs');
//segfaultHandler = require('segfault-handler');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
//segfaultHandler.registerHandler();

connectionNum = 1;
activeHttpConnections = {};

trackConnection = function(map, socket) {
  var id = connectionNum;
  map[id] = socket;
  socket.on('close', function() {
    console.log('Removing active connection from map...');
    map[id] = null;
    delete map[id];
    console.log('Removed from map.');
  });
  console.log('incrementing connection number');
  if (connectionNum > 1000000) {
    connectionNum = 1;
  } else {
    connectionNum++;
  }
  console.log('exit track connection function');
};

var options = {
    key:  fs.readFileSync('tls/key.pem'),
    cert: fs.readFileSync('tls/cert.pem')
  }

httpsServer = https.createServer(options, function(req, res) {
  console.log('received request');

  req.on('data', function(chunk) {
    console.log('Recieved chunk:' + chunk);
  });

  setTimeout(function() {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end('end');
  }, 10000);
});

httpsServer.listen(8080, function() {
  console.log('HTTPS listening on port 8080');
});

httpsServer.on('connection', function(socket) {
  console.log('tracking connection');
  return trackConnection(activeHttpConnections, socket);
});

setTimeout(function() {
	console.log('closing server');
	httpsServer.close(function() {
	  console.log('server closed');
	});

	for (key in activeHttpConnections) {
	  socket = activeHttpConnections[key];
	  console.log('ending active connection');
	  socket.end();
	}
}, 5000);
