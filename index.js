const Discord = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const { prefix, token, serverId, channelID } = require('./config.json');
const client = new Discord.Client();
var http = require('http');

var server = http.createServer(function (req, res) {   // 2 - creating server
    res.writeHead(200, { 'Content-Type': 'text/html' }); 
	res.write( '<html><body><p>HelloWorld!</p></body></html>');
    res.end();
});

server.listen(process.env.PORT || 5000); 

var channel;

client.once('ready', async () => {
	console.log('Ready!')
	channel = client.channels.cache.get(channelID)
	sheduleFunction(1000 * 60 /* minutely */, updatePrice)
});

client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) {
		return
	}
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();
	if(command == "floor") {
		axios.get('https://solsea.io/collection/618298533753ebd03db7bf2c').then(({data}) => {
			var $ = cheerio.load(data);
			var floor = $('h4:contains("Floor")').text().split(' ')[1];
			axios.get('https://crypto.com/price/solana').then(({data}) => {
				$ = cheerio.load(data);
				var sol = $('span:contains("USD")').text().split(' ')[0].substring(1);
				message.channel.send(`CryoPass Floor Price: ${floor}◎ ($${(Number(floor) * Number(sol)).toFixed(2)} USD)\r\n`);
			});
		});
		return;
	}	
});

function sheduleFunction(interval, funcToCall) {
	setInterval(funcToCall, interval)
}

function updatePrice() {
	axios.get('https://crypto.com/price/solana').then(({data}) => {
		$ = cheerio.load(data);
		var sol = $('span:contains("USD")').text().split(' ')[0].substring(1);
		if(!channel) return
		channel.setName("SOL: " + sol + "USD")
		console.log(`Updated: ${sol}`)
	});
}

client.login(token);