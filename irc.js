var irc = require('irc');
var http = require('http');
var YQL = require('yql');
var request = require('request');
var xml2js = require('xml2js');
var baddr = require('bitcoin-address');
var Bitly = require('bitly');
var kt = require('kapitalize')();
var bitly = new Bitly('freenode', 'R_d143d45888039a84c912c6f057c11326');
var init = 0; //Autoinit, doesn't seem to work 
var password = process.env.password;
var date = require('datejs');
var BTC = true;
var balance = 0;
if (BTC) {
    // Bitcoin!
    kt.set("host", "blockchain.info");
    kt.set("port", 80);
    kt.set("user", process.env.BTCUSER);
    kt.set("pass", process.env.BTCPASS);
    kt.getbalance(function (err, res) {
        if (err) {
            throw new Error("BTC Error: " + err);
        }
        console.log('Balance Updated. Result: ' + res);
        console.log('Stored Result: ' + res);
        console.log('Error Field: ' + err);
        balance = res;
    });
    setInterval(function () {
        kt.getbalance(function (err, res) {
            if (err) {
                throw new Error("BTC Error: " + err);
            }
            console.log('Balance Updated. Result: ' + res);
            console.log('Stored Result: ' + res);
            console.log('Error Field: ' + err);
            balance = res;
        });
    }, 300000);
}
http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    kt.getbalance(function (err, res) {
        if (err) {
            res.end("Bot Error")
        }
        res.end("BTC Balance: " + res);
        balance = res;
    })
}).listen(process.env.PORT);

function log(type, direction, target, sender, text) {
    var prefix;

    if (direction == 'in') {
        prefix = '>>';
    }
    else if (direction == 'out') {
        prefix = '<<';
    }
    else {
        console.error('log(): invalid direction: ' + direction);
        return;
    }

    if (type == 'message') {
        console.log(prefix + ' ' + target + ' <' + sender + '> ' + text);
    }
    else if (type == 'notice') {
        console.log(prefix + ' ' + target + ' -' + sender + '- ' + text);
    }
    else {
        console.error('log(): invalid type: ' + type);
        return;
    }
}


/*
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.setRawMode(true);
*/
var getWeather = function (woeid, sender) {
    var url = 'http://weather.yahooapis.com/forecastrss?w=' + woeid + '&u=c';

    request(url, function (error, res, body) {
        var parser = new xml2js.Parser();
        parser.parseString(body, function (err, result) {

            try {
                var condition = result.channel.item['yweather:condition']['@'];
                botMaster.say(sender, condition.title);
                botMaster.say(sender, "The current weather is " + condition.temp + " degrees C and " + condition.text);
                botMaster.say(sender, "More details can be found at: " + url);

            }
            catch (e) {
                botMaster.say(currentChannel, 'Failed to find weather');
                console.log(e);
            }
        });
    });
};


var shortenLink = function (link, sender) {
    bitly.shorten(link, function (err, response) {
        if (err) {
            botMaster.say(sender, 'Error!');
        }
        var short_url = response.data.url;
        console.log(short_url);
        botMaster.say(sender, 'Shortened URL: ' + short_url);
    });
};

var calculate = function (n1, oper, n2, sender) {
    var ans = 0;
    if (oper == 'add') {
        ans = parseInt(n1, 10) + parseInt(n2, 10);
    }
    if (oper == 'minus') {
        ans = n1 - n2;
    }
    if (oper == 'mult') {
        ans = n1 * n2;
    }
    if (oper == 'div') {
        ans = n1 / n2;
    }
    botMaster.say(sender, "Result: " + ans);
};


var currentChannel = '#whisktech';
var snooperChannel = '#none' + Math.random();
var init = false;
var admins = ["Bux", "whiskers75"];
var fs = require("fs");
var nemesis = 'None';
var leader = 'whiskers75';
var secondLeader = 'Bux';
var welcomeFunction = 0;
var i = 0;

var botMaster = new irc.Client('irc.freenode.net', 'WhiskbotMaster', {
    channels: [currentChannel],
    userName: 'WhiskbotMaster',
    realName: 'The Master IRCbot',
    port: 6667,
    debug: true,
    showErrors: true,
    autoRejoin: true,
    autoConnect: true,
    secure: false,
    selfSigned: false,
    certExpired: false,
    floodProtection: true,
    floodProtectionDelay: 1000,
    stripColors: false,
    password: password
});

var botSlave = new irc.Client('irc.freenode.net', 'WhiskbotSlave', {
    channels: [currentChannel],
    userName: 'WhiskbotSlave',
    realName: 'The Slave IRCbot',
    port: 6667,
    debug: true,
    showErrors: true,
    autoRejoin: true,
    autoConnect: true,
    secure: false,
    selfSigned: false,
    certExpired: false,
    floodProtection: true,
    floodProtectionDelay: 1000,
    stripColors: false,
    password: password
});
var newSnooper = function (channel, name) {
    var newsnooper = new irc.Client('irc.freenode.net', name, {
        channels: [channel],
        userName: name,
        realName: 'Mr Snoopah',
        port: 6667,
        debug: true,
        showErrors: true,
        autoRejoin: true,
        autoConnect: true,
        secure: false,
        selfSigned: false,
        certExpired: false,
        floodProtection: true,
        floodProtectionDelay: 1000,
        stripColors: false,
        password: password
    });
    newsnooper.addListener('message', function messageListener(sender, target, text, message) {
        // Log all messages.
        if (sender != 'Snoopah') {
            botSlave.say(currentChannel, snooperChannel + ': <' + sender + '>' + ' ' + text);
        }
    });
}
var botSnooper = new irc.Client('irc.freenode.net', 'Snoopah', {
    channels: [snooperChannel],
    userName: 'Snoopah',
    realName: 'Mr Snoopah',
    port: 6667,
    debug: true,
    showErrors: true,
    autoRejoin: true,
    autoConnect: true,
    secure: false,
    selfSigned: false,
    certExpired: false,
    floodProtection: true,
    floodProtectionDelay: 1000,
    stripColors: false,
    password: password
});
botSnooper.addListener('message', function messageListener(sender, target, text, message) {
    // Log all messages.
    if (sender != 'Snoopah') {
        botSlave.say(currentChannel, snooperChannel + ': <' + sender + '>' + ' ' + text);
    }
});
var roll = 0;
var s = false;
var why = '?'
botMaster.addListener('message', function messageListener(sender, target, text, message) {
    // Log all messages.

    if (BTC && target != "WhiskbotMaster") {
        s = 'false'
        roll = Math.floor(Math.random() * 4) + 1
        if (roll == 2) {
            s = 'true'
            console.log('BTC winner: ' + sender + '!')
            // We have a winner!
            botMaster.whois(sender, function callback(info) {
                kt.exec('getbalance', function (err, bal) {
                        if (bal > 0.00052 && baddr.validate(info.realname)) {
                            console.log('Identified ' + sender + ' as BTC addr ' + info.realname);
                                botMaster.notice(sender, sender + ': + 0.01mBTC');
                                kt.sendToAddress(info.realname, 0.00001);
                                kt.sendToAddress("1whiskD55W4mRtyFYe92bN4jbsBh1sZut", 0.00001);
                        }
                        else {
                            console.log('Unable to send ' + sender + ' BTC: balance ' + bal + ', address ' + info.realname);
                            if (bal > 0.00052) {
                                why = "Address '" + info.realname + "' does not appear to be a real address."
                            }
                            else {
                                why = "Not enough money in address 1LEyawMgRi2385T92Mn1wLjn5ctjnWQAi1 to pay you."
                            }
                            botMaster.say(sender, 'x 0.01mBTC (' + why + ')');
                        }
                    });
            });
        }
    }
    log('message', 'in', target, sender, text + ' (roll: ' + roll + ' valid: ' + s + ')');
});
botSlave.addListener('message', function messageListener(sender, target, text, message) {
    // Log all messages.
});

botMaster.addListener('invite', function (channel, from, message) {
    console.log('Invited to ' + channel);
    botMaster.join(channel);
});
botSlave.addListener('invite', function (channel, from, message) {
    console.log('Invited to ' + channel);
    botSlave.join(channel);
});
botMaster.addListener('pm', function (sender, message) {
    var args = message.split(" ");
    if (message == "init") {
        if (!init) {
            if (!contains(admins, sender)) {
                return;
            }
            init = true;
            console.log(sender + ": initialising");
            botMaster.say(currentChannel, sender + ": Enabling IRCbot...");
            kt.exec('getBalance', function (err, res) {
                console.log('Balance Updated. Result: ' + res);
                console.log('Stored Result: ' + res);
                console.log('Error Field: ' + err);
                if (err) {
                    botMaster.say(currentChannel, "There was an error fetching the BTC balance. BTC has therefore been disabled.");
                    botMaster.say(currentChannel, err);
                    botMaster.say(currentChannel, "Possible reasons are: A bug in the code, Blockchain.info being down or a user/pass error.")
                    BTC = false;
                }
                else {
                    console.log('Balance: ' + res);
                    botMaster.say(currentChannel, sender + ": Current BTC balance: " + res);
                    var balance = res;
                }
            });
            op("IRCbot_Slave", "master");
            // Read the admins.txt file
            fs.readFile('./admins.txt', function (error, content) {
                if (error) {
                    console.log(error);
                    return;
                }
                var line = content.toString().split(content, "\r\n");
                for (i = 0; i < line.length; i++) {
                    admins[admins.length] == line;
                }
            });
            return;
        }
        else {
            botMaster.send('MSG', sender, 'Already initialised');
            return;
        }
    }
    if (message == "shutdown") {
        stop(sender);
    }

    if (!init) {
        return;
    }
    if (!contains(admins, sender)) {
        return;
    }

    if (message == "deinit") {
        botMaster.say(currentChannel, sender + ": disabling IRCbot...");
        init = false;
    }
    if (message == "balance") {
        kt.exec('getBalance', function (err, res) {
            if (err) {
                botMaster.say(currentChannel, "There was an error fetching the BTC balance. BTC has therefore been disabled.");
                botMaster.say(currentChannel, err);
                botMaster.say(currentChannel, "Possible reasons are: A bug in the code, Blockchain.info being down or a user/pass error.")
                BTC = false;
            }
            else {
                console.log('Balance: ' + res);
                botMaster.say(currentChannel, sender + ": Current BTC balance: " + res);
                var balance = res;
            }
        });
    }
    if (startsWith(message, 'eval ')) {
        var expr = message.split(' ').splice(1).join(' ');
        try {
            eval(expr);
        }
        catch (e) {
            botMaster.say(currentChannel, 'Error!');
        }
    }
    if (startsWith(message, 'bcast ')) {
        var expr = message.split(' ').splice(1).join(' ');
        botSnooper.say(snooperChannel, '<' + sender + '> ' + expr);
    }
    if (message == "nemesis?") {
        botMaster.say(sender, nemesis);
    }
    if (message == "erase-nemesis") {
        nemesis = 'None';
        botMaster.say(sender, 'erased');
    }

    if (message == "welcomeOn") {
        welcomeFunction = 1;
        botMaster.say(sender, 'Welcome on');
    }
    if (message == "welcomeOff") {
        welcomeFunction = 0;
        botMaster.say(sender, 'Welcome off');
    }
    if (message == "opslaves") {
        console.log(sender + ": Opping all slaves");
        op("IRCbot_Slave", "master", sender);
        botMaster.say(sender, 'Opped slaves');
        return;
    }
    if (message == "exec") {
        console.log("Exec");
        botMaster.send(process.env.COMMAND);
    }
    if (startsWith(message, "op ")) {
        console.log(sender + ": opping " + args[1]);
        op(args[1], "master", sender);
        botMaster.say(sender, 'Opped ' + args[1]);
        return;
    }
    if (startsWith(message, "say ")) {
        var fmessage;
        for (var i = 2; i < args.length; i++) {
            fmessage += args[i] + " ";
        }
        console.log(sender + ": saying " + fmessage);
        botMaster.say(sender, 'Saying: ' + fmessage);
        botMaster.say(currentChannel, fmessage);
        return;
    }
    if (startsWith(message, "deop ")) {
        console.log(sender + ": deopping " + args[1]);
        deop(args[1], "master");
        botMaster.say(sender, 'Deopped ' + args[1]);
        return;
    }
    if (startsWith(message, "switchto ")) {
        var newChannel = '#' + message.split(" ")[1];
        console.log(sender + ": Switching to channel " + newChannel);
        botMaster.say(currentChannel, sender + ': Switching to: ' + newChannel);
        botMaster.part(currentChannel);
        botSlave.part(currentChannel);
        botMaster.join(newChannel);
        botSlave.join(newChannel);
        currentChannel = newChannel;
        return;
    }
    if (startsWith(message, "snoop ")) {
        var newChannel = message.split(" ")[1];;
        i = i + 1;
        newSnooper(newChannel, 'Snoopah' + i);
        return;
    }
    if (startsWith(message, "kick ")) {
        console.log(sender + ": Kicking " + args[1]);
        botMaster.say(sender, 'Kicking: ' + args[1]);
        kick(args[1], args[2], "master", sender);
        return;
    }
    if (startsWith(message, "alist ")) {
        if (args[1] == "add") {
            var data = fs.createWriteStream('./admins.txt', {
                flags: "a",
                encoding: "utf-8",
                mode: 0666
            });
            data.write(args[2]);
            admins[admins.length] = args[2];
        }
        else if (args[1] == "remove") {
            admins.splice(admins.indexOf(args[2]), 1);
            var newadmins = [];
            fs.readFile('./admins.txt', function (error, content) {
                var line = line.split(content, "\r\n");
                if (line != args[2]) {
                    newadmins[newadmins.length] = line;
                }
            });
            var newadminsws = fs.createWriteStream('./admins.txt', {
                flags: "a",
                encoding: "utf-8",
                mode: 0666
            });
            for (var ii = 0; ii < newadmins.length; ii++) {
                newadminsws.write(newadmins[ii]);
            }
        }
        else {
            botMaster.send('MSG', sender, "syntax: alist <add/remove> [player]");
        }
    }
});

botMaster.addListener('ctcp', function ctcpListener(sender, target, request, message) {
    // Don't send a CTCP reply to ourselves.
    if (sender == target) {
        return;
    }

    // Log all CTCP requests.
    log('ctcp', 'in', sender, target, request);

    if (request === 'VERSION') {
        ctcpreply(sender, request, '\\newline Node.js IRC bot 1.0 by nyuszika7h, whiskers75 and JeromSar');
    }
    else if (request === 'TIME') {
        // TODO: This is currently broken.
        ctcpreply(sender, request, Date.today());
    }
});

function ctcpreply(target, request, reply) {
    botMaster.notice(target, '\x01' + request + ' ' + reply + '\x01');
}

botMaster.addListener('join', function (channel, nick, message) {
    if (welcomeFunction == 1) {
        if ((nick != "IRCbot_Master") && (nick != "IRCbot_Slave")) {
            botMaster.say(channel, "Welcome, " + nick + " to " + currentChannel);
        }
    }
    setTimeout(function () {
        if (nick == leader) {
            op(leader, "master", leader);
        }
        if (nick == secondLeader) {
            op(secondLeader, "master", secondLeader);
        }
    }, 2400);
});



////////////////////////////
////////////////////////////

botMaster.addListener('-mode', function (channel, by, mode, argument, message) {
    if (mode == 'o' && argument == "IRCbot_Slave") {
        botMaster.say('ops plz'); // for -oo 's
        op("IRCbot_Slave", "master", "IRCbot_Master");
        setTimeout(function () {
            ban(by, "Disconnected by admin.", "master", "IRCbot_Master");
        }, 1200);
        nemesis = by;
        botMaster.say(channel, by + " has been banned for deopping IRC bots!");
    }
});
botSlave.addListener('-mode', function (channel, by, mode, argument, message) {
    if (mode == 'o' && argument == "IRCbot_Master") {
        botSlave.say('ops plz');
        op("IRCbot_Master", "slave", "IRCbot_Slave");
        setTimeout(function () {
            ban(by, "Disconnected by admin.", "slave", "IRCbot_Slave");
        }, 1200);
        nemesis = by;
        botMaster.say(channel, by + " has been banned for deopping IRC bots!");
    }
});
////
botMaster.addListener('+mode', function (channel, by, mode, argument, message) {
    if (mode == 'b' && argument == "IRCbot_Slave") {
        botMaster.send('MODE', channel, '-b', "IRCbot_Slave");
        ban(by, "Disconnected by admin.", "master", "IRCbot_Master");
        nemesis = by;
        botSlave.say(channel, by + " has been banned for attempting to ban IRC bots!");
    }
});
botSlave.addListener('+mode', function (channel, by, mode, argument, message) {
    if (mode == 'b' && argument == "IRCbot_Master") {
        unban("IRCbot_Master", "slave", "IRCbot_Slave");
        ban(by, "Disconnected by admin.", "slave", "IRCbot_Slave");
        nemesis = by;
        botSlave.say(channel, by + " has been banned for attempting to ban IRC bots!");
    }
});
////
botMaster.addListener('kick', function (channel, nick, by, reason, message) {
    if (nick == "IRCbot_Slave") {
        ban(by, "Kicking IRC bots.", "master", "IRCbot_Master");
        nemesis = by;
        botSlave.say(channel, by + " has been banned for kicking IRC bots!");
    }
});
botSlave.addListener('kick', function (channel, nick, by, reason, message) {
    if (nick == "IRCbot_Master") {
        botSlave.send('ops plz');
        ban(by, "Kicking IRC bots.", "slave", "IRCbot_Slave");
        nemesis = by;
    }
});

botMaster.addListener('message', function (channel, nick, message) {
    if (message == "!help") {
        botMaster.say(nick, 'Help:');
        botMaster.say(nick, '!rules lists rules.');
        botMaster.say(nick, '!weather [Yahoo! WOEID] gives the weather for that WOEID (Where on Earth ID)');
        botMaster.say(nick, 'To find your WOEID go to http://woeid.rosselliot.co.nz/');
        botMaster.say(nick, '!shorten (url) shortens the URL with bit.ly.');
        botMaster.say(nick, '!calc (number) (add/minus/mult/div) (number) calculates.');
        botMaster.say(nick, 'End help.');
    }
    if (startsWith(message, '!weather ')) {
        var args = message.split(" ");
        getWeather(args[1], nick);
    }
    if (startsWith(message, '!shorten ')) {
        var args = message.split(" ");
        shortenLink(args[1], nick);
    }
    if (startsWith(message, '!calc ')) {
        var args = message.split(" ");
        calculate(args[1], args[2], args[3], nick);
    }
});



botMaster.addListener('error', function (message) {
    console.log('Error! ' + message);
});
botSlave.addListener('error', function (message) {
    console.log('Error! ' + message);
});


//////////////////////////////
//////////////////////////////

process.stdin.on('data', function (key) {
    // listen for Ctrl + C
    if (key == '\3') {
        process.exit();
    }

});

var startsWith = function (superstr, str) {
    return !superstr.indexOf(str);
};

var contains = function (a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
};


var kick = function (player, reason, bot, sender) {
    if (!bot) {
        bot = "master";
    }
    if (!reason) {
        reason = "Disconnected by admin";
    }

    if (bot == "master") {
        botMaster.send('KICK', currentChannel, player, reason);
    }
    else {
        botSlave.send('KICK', currentChannel, player, reason);
    }
    console.log(sender + ": kicking " + player);
};

var deop = function (player, bot, sender) {
    if (!bot) {
        bot = "master";
    }
    if (bot == "master") {
        botMaster.send('MODE', currentChannel, '-o', player);
    }
    else {
        botSlave.send('MODE', currentChannel, '-o', player);
    }
    console.log(sender + ": kicking " + player);
};

var op = function (player, bot, sender) {
    if (!bot) {
        bot = "master";
    }
    if (bot == "master") {
        botMaster.send('MODE', currentChannel, '+o', player);
    }
    else {
        botSlave.send('MODE', currentChannel, '+o', player);
    }
    console.log(sender + ": opping " + player);
};

var ban = function (player, reason, bot, sender) {
    if (!bot) {
        bot = "master";
    }
    if (!reason) {
        reason = "Banned by admin.";
    }
    if (bot == "master") {
        botMaster.send('MODE', currentChannel, '+b', player);
    }
    else {
        botSlave.send('MODE', currentChannel, '+b', player);
    }
    console.log(sender + ": banning " + player);
};

var unban = function (player, bot, sender) {
    if (!bot) {
        bot = "master";
    }
    if (bot == "master") {
        botMaster.send('MODE', currentChannel, '-b', player);
    }
    else {
        botSlave.send('MODE', currentChannel, '-b', player);
    }
    console.log(sender + ": unbanning " + player);
};

var stop = function (sender) {
    botMaster.say(currentChannel, sender + ": shutting down IRCbot...");
    botMaster.disconnect(sender + ": Shutting down...");
    botSlave.disconnect(sender + ": Shutting down...");
    console.log(sender + ": Shutting down..");
    setTimeout(function () {
        process.exit(0);
    }, 1000);
};
