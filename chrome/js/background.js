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

				// Preparando o texto a ser impresso
				var amount = resp["last"];
				var amountPos = String(amount).indexOf('.');

				if( (amountPos != -1) && (amountPos < 4) ) {
					badgeText = "" + amount.toPrecision(3);
				} else {
					badgeText = "" + amount.toPrecision(4);
				}
				
				// Determina cor de fundo do "badge"
				if (amount>value){
					chrome.browserAction.setBadgeBackgroundColor({color: "#00CC00"});
				} else {
					chrome.browserAction.setBadgeBackgroundColor({color: "#CC0000"});
				}
				value = amount;
				
				// Setando texto no Badge
				chrome.browserAction.setBadgeText({text: badgeText});
				chrome.browserAction.setTitle({title: "O preço de 1 bitcoin agora é R$" + value + "."});
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