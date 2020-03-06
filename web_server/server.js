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

const word2vecConnection = new WebSocket('ws://127.0.0.1:1337/');

let link = "link";

// router.get('/:link', function(req,res){
// 	if (req.params.link.trim() === link.trim()) {
// 		res.sendFile(path.join(__dirname+'/views/index.html'));
// 	} else if (req.params.link === "qrcode") {
// 		res.sendFile(path.join(__dirname+'/views/qrcode.html'));
// 	} else {
// 		res.sendFile(path.join(__dirname+'/views/error.html'));
// 	}	
// });

router.get('/', function(req,res){
	res.sendFile(path.join(__dirname+'/views/index.html'));	
});

app.use(express.static('public'));

//add the router
app.use('/', router);

//start our server
server.listen(process.env.PORT || 80, () => {
	console.log(`Server started on port ${server.address().port}`);
});



// On genere un nouveau lien toutes les 10 minutes
let qrClients = [];
// changelink();
// setInterval(() => {
// 	changelink();
// }, 600000);


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



		if (json.type === 'mot') {
			if (json.location.replace('/', '') === link) {
				if(json.mot !== undefined) {
					json.mot.split(" ").forEach(mot => {
						console.log(mot);
						if (word2vecConnection !== undefined) {
							word2vecConnection.send(mot);		
						}
					});
				}
			} else {
				connection.send(JSON.stringify({"type" : "newRoom"}));
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

function changelink() {
	fs.readFile('server_assets/mots.txt', 'utf8', function(err, data){
		if(err) throw err;
		var lines = data.split('\n');
		link = "" + Math.floor(Math.random()*100) + lines[Math.floor(Math.random()*lines.length)].trim() + Math.floor(Math.random()*100);
		qrClients.forEach(client => {
			if (client !== undefined) {
				client.send(JSON.stringify({"type" : "qr", "link": link}));
			}
		});
		clients.forEach(client => {
			client.send(JSON.stringify({"type" : "newRoom"}));
		});
	});
}