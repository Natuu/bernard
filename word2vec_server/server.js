const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const w2v = require('word2vec');
const {PCA} = require('ml-pca');

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-server';


//initialize a simple http server
let display = new WebSocket.Server({
	port: 1338
});

let wordReceiver = new WebSocket.Server({
	port: 1337
});

let words = [];
let wordsVec = [];

let displayConnected = false;
let displayConnection;
let firstRun = false;
let components = ["x", "y", "color", "font"]



let firstRunData = {words: [
	{value: "bienvenue", new: true, x: 0.35, y: 0.5, color: 0.5, font: 1},
	{value: "dans", new: true, x: 0.45, y: 0.5, color: 0.5, font: 1},
	{value: "notre", new: true, x: 0.55, y: 0.5, color: 0.5, font: 1},
	{value: "expérience", new: true, x: 0.65, y: 0.5, color: 0.5, font: 1}

]};
w2v.loadModel("./model4.bin", function(error, model) {
	//ne pas enlever svp
	console.log(error);

	// populate data with starting words
	mots = ["bienvenue", "dans", "notre", "expérience"];
	mots.forEach(mot => {
		let i = wordsVec.push(Array.prototype.slice.call(model.getVector(mot).values));
		//console.log(wordsVec);
		words[i-1] = mot;
		
	});

	//start our server
	display.on('connection', function connection(ws) {
		console.log(`Display connected`);
		setInterval(() => {ws.ping()}, 10000);

		displayConnected = true;
		displayConnection = ws;
		displayConnection.send(JSON.stringify(firstRunData));
		ws.on('close', function() {
			console.log((new Date()) + " display client disconnected.");
			displayConnected = false;
			displayConnection = null;
		});


	});

	//start our server
	wordReceiver.on('connection', function connection(ws) {
		console.log(`Word client connected`);
		setInterval(() => {ws.ping()}, 10000);


		// This callback function is called every time someone
		// tries to connect to the WebSocket server
		ws.on('message', function(message) {
			//console.log("received: " + message);
			message = message.trim();
			
			if (displayConnected) {
				if (message === "[[[reset]]]") {
					words = [];
					wordsVec = [];
					displayConnection.send(JSON.stringify({"reset": true}));
					mots = ["bienvenue", "dans", "notre", "expérience"];
					mots.forEach(mot => {
						let i = wordsVec.push(Array.prototype.slice.call(model.getVector(mot).values));
						//console.log(wordsVec);
						words[i-1] = mot;
						
					});
					displayConnection.send(JSON.stringify(firstRunData));
					return;
				}
				if (model.getVector(message) === null)
					return;

				// si le mot existe deja on ignore le message
				if (words.includes(message)) return;

				let index = wordsVec.push(Array.prototype.slice.call(model.getVector(message).values));
				//console.log(wordsVec);
				words[index-1] = message; // on place le nouveau mot
					
				
				let pca = new PCA(wordsVec, {scale: true});
				let res = pca.predict(wordsVec, {nComponents: components.length});


				// scale axis
				let min = [];
				let max = [];
				for (i = 0; i < res.columns; i++) {
					min[i] = res.minColumn(i); // comme on fait Add et pas sub, on ajoute l'opposé
					max[i] = res.maxColumn(i);	
				}

				let resScaled = new Array(res.rows);

				for (i = 0; i < res.rows; i++) {
					resScaled[i] = new Array(res.columns);
					for (j = 0; j < res.columns; j++) {
						resScaled[i][j] = (res.get(i, j) - min[j]) / (max[j]-min[j]);
					}
				}
				// console.log("### RES");
				// console.log(res);
				// console.log("### MIN");
				// console.log(min);
				// console.log("### MAX");
				// console.log(max);
				// console.log("### RESSCALED");
				// console.log(resScaled);

				let jsonData = {};
				let isnew = false;
				//console.log(words)
				jsonData.words = new Array(words.length);
				for (i = 0; i < words.length; i++) {
					isnew = (i == index-1);
					console.log(words[i] + " is new: " + isnew);
					jsonData.words[i] = {"value": words[i], "new": isnew};
					for (j = 0; j < components.length; j++) {
						jsonData.words[i][components[j]] = resScaled[i][j].toFixed(2);
					}
				}
				if (firstRun) firstRun = false;
				
				//todo: send data to processing (word_x_y_isnew:word2_x2_y2_isnew:...)
				if (displayConnected) {
					displayConnection.send(JSON.stringify(jsonData));
				}
			}
		});

		// user disconnected
		ws.on('close', function() {
			console.log((new Date()) + " Word client disconnected.");
		});
	});
		
	



		
});


