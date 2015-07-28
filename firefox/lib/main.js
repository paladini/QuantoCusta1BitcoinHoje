// Carregando essenciais.
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var { ToggleButton } = require("sdk/ui/button/toggle");
var { setInterval } = require("sdk/timers");
var Request = require("sdk/request").Request;

// Declarando variáveis usadas no código.
var value = 0.0;
var response = "";

// Criando botão na interface.
var button = ToggleButton({
    id: "my-button1",
    label: "Atualizando...",
    icon: {
	    "16": "./icon-16.png",
	    "48": "./icon-48.png",
	    "128": "./icon-128.png"
	},
  	onClick: handleClick,
    onChange: readTicker,
    badge: value,
    badgeColor: "#00CC00"
});

function readTicker() {
	
	// Consultando API da Foxbit
	Request({
		url: "https://api.blinktrade.com/api/v1/BRL/ticker?crypto_currency=BTC",
		onComplete: function(response) {

			if (response.status == 200) {
				// Obtendo a resposta e parseando o JSON.
				var resp = response.json; 

				// Preparando o texto a ser impresso
				var amount = resp["last"];
				var amountPos = String(amount).indexOf('.');
				
				// Detect the number of digits of the price.
				var size = 0;
				if (amountPos != -1) {
					size = (amount + '').substring(0, amountPos).length;
				} else {
					size = (amount + '').length;				
				}

				if (size >= 5) { // Can't show more than 4 digits in Firefox badge.
					badgeText = "9999";
				} else {
					badgeText = "" + amount.toPrecision(size);
				}
				
				// Determina cor de fundo do "badge"
				if (amount > value) {
				    button.badgeColor = "#00CC00";
				} else if (amount < value) {
				    button.badgeColor = "#CC0000";
				}
				value = amount;
				
				// Setando texto no Badge
				button.badge = badgeText;
				button.label = "O preço de 1 bitcoin agora é R$" + value;
			}
		}
	}).get();

}

function handleClick(state) {
  tabs.open("http://www.foxbit.com.br");
}

// Seta o intervalo em que o ticker vai ser atualizado (em ms).
readTicker();
setInterval(readTicker, 60000);