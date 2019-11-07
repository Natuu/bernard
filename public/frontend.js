$(function () {
	"use strict";
	
	// for better performance - to avoid searching in DOM
	
	// if user is running mozilla then use it's built-in WebSocket
	window.WebSocket = window.WebSocket || window.MozWebSocket;
	
	// if browser doesn't support WebSocket, just show some notification and exit
	if (!window.WebSocket) {
		content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
		+ 'support WebSockets.'} ));
		input.hide();
		$('span').hide();
		return;
	}
	
	// open connection
	var connection = new WebSocket('ws://' + "localhost" + ":1337");
	
	connection.onopen = function () {
		connection.send(JSON.stringify({"type": "location", "location": window.location.pathname}));
	};
	
	connection.onerror = function (error) {
		// just in there were some problems with conenction...
		$('body').html($('<p>', { text: 'Sorry, but there\'s some problem with your '
		+ 'connection or the server is down.' } ));
	};
	
	// most important part - incoming messages
	connection.onmessage = function (message) {
		try {
			var json = JSON.parse(message.data);
		} catch (e) {
			console.log('This doesn\'t look like a valid JSON: ', message.data);
			return;
		}
		
		// On met la couleur de l'equipe en fond
		if (json.type === 'newRoom') {
			$('body').html('La salle a changé, veuillez rescanner le qrcode');
		}
		else {
			console.log('Hmm..., I\'ve never seen JSON like this: ', json);
		}
	};
	
	form.submit(function (e) {
		e.preventDefault();
		let mot = {};
		mot.type = "mot";
		mot.mot = $('#mot').val();
		mot.location = window.location.pathname;
		$('#mot').val('');
		if (mot.mot.match(/^[a-zA-Zàéèëêôö\- ]+$/g)) {
			mot.mot = mot.mot.toLowerCase();
			connection.send(JSON.stringify(mot));
		} else {
			alert('Erreur dans la saisie de lettres et d\'espaces');
		}
	});


	$('.random').on('click', function() {
		$.get("public/mots.txt", function(wholeTextFile) {
			let lines = wholeTextFile.split(/\n/),
			  randomIndex = Math.floor(Math.random() * lines.length);
			$('#mot').val(lines[randomIndex]);
		  })
	});
});