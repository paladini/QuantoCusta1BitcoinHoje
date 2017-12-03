var value = 0.0;
var response = "";

function readTicker() {
	// Consultando API da Foxbit
	var xhr	= new XMLHttpRequest();
	xhr.open("GET", "https://api.blinktrade.com/api/v1/BRL/ticker?crypto_currency=BTC");
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				
				// Obtendo a resposta e parseando o JSON.
				response = xhr.responseText;
				var resp = JSON.parse(response);

				// Preparando o texto a ser impresso no badge (sem casas decimais).
				var amount = Number(resp["last"]).toFixed(0);

				amount = abbrNum(amount,1);

				// Fazendo localização para moeda e padrão de números brasileiro
				var cotacao = parseFloat(resp["last"].toPrecision()).toLocaleString('pt-BR');
				
				// Adiciona vírgula no final do valor monetário do Bitcoin (somente caso falte).
				if (cotacao.indexOf(",") == -1) {
					cotacao = cotacao + ",00";
				}

				// Determina cor de fundo do "badge"
				var color = "#CC0000";
				if (amount>value){
					color = "#00CC00"
				}

				chrome.browserAction.setBadgeBackgroundColor({color: color});

				value = amount;

				// Setando texto no Badge
				chrome.browserAction.setBadgeText({text: String(amount)});
				chrome.browserAction.setTitle({title: "O preço de 1 bitcoin agora é R$ " + cotacao});
			}
		}
	}

	xhr.send();
}

function onAlarm(alarm) {
	if (alarm && alarm.name == 'refresh') {
		readTicker();
	}
}

function abbrNum(number, decPlaces) {
	// 2 decimal places => 100, 3 => 1000, etc
	decPlaces = Math.pow(10,decPlaces);

	// Enumerate number abbreviations
	var abbrev = [ "k", "m", "b", "t" ];

	// Go through the array backwards, so we do the largest first
	for (var i=abbrev.length-1; i>=0; i--) {

		// Convert array index to "1000", "1000000", etc
		var size = Math.pow(10,(i+1)*3);

		// If the number is bigger or equal do the abbreviation
		if(size <= number) {
			// Here, we multiply by decPlaces, round, and then divide by decPlaces.
			// This gives us nice rounding to a particular decimal place.
			number = Math.round(number*decPlaces/size)/decPlaces;

			// Handle special case where we round up to the next abbreviation
			if((number == 1000) && (i < abbrev.length - 1)) {
				number = 1;
				i++;
			}

			number += abbrev[i];
			break;
		}
	}

	if( number.length > 4 )
		number = number.slice(0, -1);

	return number;
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.request == "request")
			sendResponse({data: response});
	}
);

// Abrindo página da Foxbit ao clicar no ícone.
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({'url': "http://www.foxbit.com.br"});
});

// Criando alarme para atualizar a cada 1 minuto.
chrome.alarms.create('refresh', {periodInMinutes: 1.0});
chrome.alarms.onAlarm.addListener(onAlarm);

// Lendo o ticker.
readTicker();