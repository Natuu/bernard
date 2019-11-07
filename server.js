const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-server';


//initialize a simple http server
const server = http.createServer(app);
var wsServer = new WebSocket.Server({
	server: server
});

let link = "test";

router.get('/:link', function(req,res){
	if (req.params.link === link) {
		res.sendFile(path.join(__dirname+'/views/index.html'));
	} else if (req.params.link === "qrcode") {
		res.sendFile(path.join(__dirname+'/views/qrcode.html'));
	} else {
		res.sendFile(path.join(__dirname+'/views/error.html'));
	}	
});

app.use('/:link/public', express.static('public'));

//add the router
app.use('/', router);

//start our server
server.listen(process.env.PORT || 1337, () => {
	console.log(`Server started on port ${server.address().port}`);
});



// On genere un nouveau lien toutes les 60000 ms
let qrClients = [];
setInterval(() => {
	fs.readFile('server_assets/mots.txt', 'utf8', function(err, data){
		if(err) throw err;
		var lines = data.split('\n');
		link = lines[Math.floor(Math.random()*lines.length)];
	});
	qrClients.forEach(client => {
		if (client !== undefined) {
			client.send(JSON.stringify({"type" : "qr", "link": link}));
		}
	});
}, 600000);


let clients = [];
let affichage;

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('connection', function(connection) {
	
	console.log((new Date()) + ' Connection');
	
	// we need to know client index to remove them on 'close' event
	var index = clients.push(connection) - 1;
	var indexQR = -1;

	setInterval(() => {connection.ping()}, 10000);
	
	
	// user sent some message
	connection.on('message', function(message) {
		try {
			var json = JSON.parse(message);
		} catch (e) {
			console.log('This doesn\'t look like a valid JSON: ', message);
			return;
		}
		
		if (json.type === 'qr') {
			connection.send(JSON.stringify({"type" : "qr", "link": link}));
			if (qrClients.indexOf(connection) === -1) {
				indexQR = qrClients.push(connection) - 1;
			}
		}

		if (json.type === 'display') {
			affichage = connection;
			console.log('display');
		}

		if (json.type === 'mot') {
			console.log(json.location);
			if (json.location.replace('/', '') === link) {
				affichage.send(json.mot + "_" + Math.floor(Math.random()*2000) + "_" + Math.floor(Math.random()*1000))
			} else {
				
			}
		}
		
	});
	
	// user disconnected
	connection.on('close', function() {
		console.log((new Date()) + " Peer disconnected.");
		// remove user from the list of connected clients
		if (indexQR !== -1) {
			qrClients.splice(indexQR, 1);
		}
		if (index !== -1) {
			clients.splice(index, 1);
		}
	});
	
});

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}