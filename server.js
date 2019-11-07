const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const WebSocket = require('ws');
const http = require('http');
const request = require('request');

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-server';


//initialize a simple http server
const server = http.createServer(app);
var wsServer = new WebSocket.Server({
	server: server
});

let link = "getWord('server_assets/mots.txt')";

router.get('/qrcode',function(req,res){
	res.sendFile(path.join(__dirname+'/views/qrcode.html'));
});

router.get('/',function(req,res){
	res.sendFile(path.join(__dirname+'/views/error.html'));
});


router.get('/' + link,function(req,res){
	res.sendFile(path.join(__dirname+'/views/index.html'));
});

app.use('/public', express.static('public'));


//add the router
app.use('/', router);

//start our server
server.listen(process.env.PORT || 1337, () => {
	console.log(`Server started on port ${server.address().port} :)`);
});



// On genere un nouveau lien toutes les 60000 ms
let qrClients = [];
setInterval(() => {
	link = getWord('server_assets/mots.txt');
	qrClients.forEach(client => {
		client.send(JSON.stringify({"type" : "qr", "link": link}));
	});
}, 60000);



// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('connection', function(connection) {
	
	console.log((new Date()) + ' Connection');
	
	// we need to know client index to remove them on 'close' event
	var index = clients.push(connection) - 1;

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
			
			if (rooms[room] === undefined) {
				rooms[room] = {"clients": [], "espions": [], "mots": [], "rouges": [], "dead" : [], "bleus": [], "blancs" : [], "done": []};
			}

			rooms[room].clients.push(connection);
			if(espion && rooms[room].espions.indexOf("rouge") < 0) {
				equipe = rooms[room].espions.push("rouge");
				connection.send(JSON.stringify({"type" : "equipe", "equipe": "rouge"}));
			}
			else if(espion && rooms[room].espions.indexOf("bleu") < 0) {
				equipe = rooms[room].espions.push("bleu");
				connection.send(JSON.stringify({"type" : "equipe", "equipe": "bleu"}));
			} 
			else {
				connection.send(JSON.stringify({"type" : "notEspion"}));
				espion = false;
			}
			
			for (const indexMot in rooms[room].mots) {
				if (rooms[room].mots.hasOwnProperty(indexMot)) {
					let res = {"type" : "mot", "mot": rooms[room].mots[indexMot]}; 
					
					res.casei = parseInt(indexMot / 5);
					res.casej = (indexMot) % 5;
					
					connection.send(JSON.stringify(res));
				}
			}

			if (rooms[room].mots.hasOwnProperty(24)) {
				connection.send(JSON.stringify({"type" : "debutPartie", "room": rooms[room]}));
				for (var i=0; i < rooms[room].done.length; i++) {						
					rooms[room].clients[i].send(JSON.stringify({"type" : "click", "casei": parseInt(rooms[room].done[i] / 5), "casej" : rooms[room].done[i] % 5}));
				}
			}
		}
		else if (rooms[room] !== undefined && rooms[room].clients !== undefined && rooms[room].espions !== undefined && rooms[room].mots !== undefined && rooms[room].rouges !== undefined && rooms[room].dead !== undefined && rooms[room].blancs !== undefined && rooms[room].bleus !== undefined && rooms[room].done !== undefined)  {
			if (json.type === 'mot') {

				if  (rooms[room].mots.length < 25) {
					// On verifie que le mot n'est pas déjà présent
					if (rooms[room].mots.indexOf(json.mot) < 0) {
						let iCase = rooms[room].mots.push(json.mot) - 1;
						
						json.casei = parseInt(iCase / 5);
						json.casej = (iCase) % 5;
						
						for (var i=0; i < clients.length; i++) {
							clients[i].send(JSON.stringify(json));
						}
					}

					if(rooms[room].mots.length === 25) {
						let aRepartir = [];
						for (let i = 0; i < 25; i++) {
							aRepartir.push(i);
						}
						shuffleArray(aRepartir);
						rooms[room].rouges = aRepartir.slice(0, 9);
						rooms[room].bleus = aRepartir.slice(9, 17);
						rooms[room].dead = aRepartir.slice(17, 18);
						rooms[room].blancs = aRepartir.slice(18, 25);
						rooms[room].done = [];

						for (var i=0; i < rooms[room].clients.length; i++) {						
							rooms[room].clients[i].send(JSON.stringify({"type" : "debutPartie", "room": rooms[room]}));
						}
					}
				}
				else {					
					connection.send(JSON.stringify({"type" : "debutPartie", "room": rooms[room]}));
				}
			}
			else if (json.type === 'click') {
				rooms[room].done.push(parseInt(json.click));

				for (var i=0; i < rooms[room].clients.length; i++) {						
					rooms[room].clients[i].send(JSON.stringify({"type" : "click", "casei": parseInt(json.click / 5), "casej" : json.click % 5}));
				}

				if (rooms[room].bleus.every((val) => rooms[room].done.includes(val))  || rooms[room].rouges.every((val) => rooms[room].done.includes(val)) || rooms[room].done.includes(rooms[room].dead[0])) {
					for (var i=0; i < rooms[room].clients.length; i++) {						
						rooms[room].clients[i].send(JSON.stringify({"type" : "finPartie"}));
						rooms[room].mots = [];
						rooms[room].done = [];
					}
				}
			}
		}
	});
	
	// user disconnected
	connection.on('close', function(connection) {
		console.log((new Date()) + " Peer disconnected.");
		// remove user from the list of connected clients
		if (espion) {
			rooms[room].espions[equipe - 1] = "";
		}
		rooms[room].clients.splice(rooms[room].clients.indexOf(connection), 1);
		clients.splice(clients.indexOf(connection), 1);

		if (rooms[room].clients.length === 0) {
			rooms[room].mots = [];
			rooms[room].done = [];
			rooms[room].espions = [];
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

function getWord(file) {
	fs.readFile(file, function(err, data){
		if(err) throw err;
		var lines = data.split('\n');
		return lines[Math.floor(Math.random()*lines.length)];
	});
}