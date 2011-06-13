
var http = require('http');
var child_process = require('child_process');
var util = require('util');

var filename = '/Users/evan/logfile.txt';

var tail = child_process.spawn('tail -f '+filename);

var respo;

server = http.createServer(function(req,res) {
	respo = res;
	console.log('request for ' + req.url);
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.write("Tailing logfile.\r\n");

}).listen(8000);

util.pump(tail.stdout, respo.write);
