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
	var connection = new WebSocket('wss://' + window.location.hostname + "");
	
	connection.onopen = function () {
		var start = {};
		new Promise((resolve) => {
			start.type = "start";
			start.room = prompt('Entrez une salle');
			start.espion = confirm('Etes vous espion ?');
			espion = start.espion;
			resolve();
		}).then(() => {
			connection.send(JSON.stringify(start));
		});
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
		if (json.type === 'equipe') {
			monEquipe = json.equipe;
			if (monEquipe === "bleu") {
				$('body').addClass('blue');
			} else if (monEquipe === "rouge") {
				$('body').addClass('red');
			}
		}
		// On définit le tour
		else if (json.type === 'tour') {
			if (json.tour === monEquipe || monEquipe === 'display') {
				monTour = true;
			} else {
				monTour = false;
			}
		}
		// On met le mot dans la bonne case (case labelisée case_i_j)
		else if (json.type === 'mot') {
			$("#case_" + json.casei + "_" + json.casej).text(json.mot);
		}
		// Case cochée
		else if (json.type === 'click') {
			$("#case_" + json.casei + "_" + json.casej).addClass('revele');
			$("#case_" + json.casei + "_" + json.casej).addClass('raye');
		}
		// Début de partie
		else if (json.type === 'debutPartie') {
			form.hide();
			debutPartie = true;

			$('.case').removeAttr('class').addClass('case');
			if (espion) {
				$('.case').addClass('revele');
			}

			json.room.rouges.forEach(mot => {
				let casei = parseInt(mot / 5);
				let casej = mot % 5;
				$("#case_" + casei + "_" + casej).addClass("rouge");
			});
			json.room.bleus.forEach(mot => {
				let casei = parseInt(mot / 5);
				let casej = mot % 5;
				$("#case_" + casei + "_" + casej).addClass("bleu");
			});
			json.room.dead.forEach(mot => {
				let casei = parseInt(mot / 5);
				let casej = mot % 5;
				$("#case_" + casei + "_" + casej).addClass("dead");
			});
		}
		// Fin de partie on vide les cases
		else if (json.type === 'finPartie') {
			form.show();
			debutPartie = false;
		}
		
		// Fin de partie on vide les cases
		else if (json.type === 'notEspion') {
			espion = false;
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
		$('#mot').val('');
		if (mot.mot.match(/^[a-zA-Z\-]+$/g)) {
			mot.mot = mot.mot.toLowerCase();
			connection.send(JSON.stringify(mot));
		} else {
			alert('Sans caractere chelou stp');
		}
	});

	$('.allrandom').on('click', function() {
		$.get("public/mots.txt", function(wholeTextFile) {
			let lines = wholeTextFile.split(/\n/);
			let mot = {};
			mot.type = "mot";
			let randomIndex;

			for (let i = 0; i < 30; i++) {
				randomIndex = Math.floor(Math.random() * lines.length);
				mot.mot = lines[randomIndex];
				connection.send(JSON.stringify(mot));
			}
		  })
	});

	$('.random').on('click', function() {
		$.get("public/mots.txt", function(wholeTextFile) {
			let lines = wholeTextFile.split(/\n/),
			  randomIndex = Math.floor(Math.random() * lines.length);
			$('#mot').val(lines[randomIndex]);
		  })
	});
	
	$('.case').on('click', function() {
		if(espion === false && debutPartie === true) {
			let choix = {};
			choix.type = "click";
			choix.click = parseInt($(this).attr('id').split("_")[1]) * 5 + parseInt($(this).attr('id').split("_")[2]);
			connection.send(JSON.stringify(choix));
		}
	});
});