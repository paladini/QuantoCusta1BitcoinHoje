var value = 0.0;
var response = "";

// function numberToReal(numero) {
//     var numero = numero.toFixed(2).split('.');
//     numero[0] = "R$ " + numero[0].split(/(?=(?:...)*$)/).join('.');
//     return numero.join(',');
// }

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

				// Preparando o texto a ser impresso
				var amount = resp["last"];
				
				// Substituindo ponto por virgula no final do preco
				// var cotacao = numberToReal(amount.toPrecision());
				var cotacao = (amount.toPrecision()).toLocaleString('pt-BR');
				// alert(typeof amount.toPrecision() === 'number');
				
				// Determina cor de fundo do "badge"
				if (amount>value){
					chrome.browserAction.setBadgeBackgroundColor({color: "#00CC00"});
				} else {
					chrome.browserAction.setBadgeBackgroundColor({color: "#CC0000"});
				}
				value = amount;
				
				// Setando texto no Badge
				chrome.browserAction.setBadgeText({text: String(amount)});
				chrome.browserAction.setTitle({title: "O preço de 1 bitcoin agora é R$" + cotacao});
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