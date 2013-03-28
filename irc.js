var irc = require('irc');
var http = require('http');
var YQL = require('yql');
var request = require('request');
var xml2js = require('xml2js');
var baddr = require('bitcoin-address');
var Bitly = require('bitly');
var tmp = 0;
var natural = require('natural');
var spamd = new natural.BayesClassifier();
var tmp2 = 0;
var kt = require('kapitalize')();
var redis = require('redis');
var pendingPayments = new Object({});
var pendingPaymentTotal = 0;
var bitly = new Bitly('freenode', 'R_d143d45888039a84c912c6f057c11326');
var init = 0; //Autoinit, doesn't seem to work 
var password = process.env.password;
var date = require('datejs');
var BTC = true;
var balance = 0;

var PAYOUT = Number(process.env.PAYOUT);

var logentries = require('node-logentries');
var logger = logentries.logger({
  token: process.env.LOGENTRIESTOKEN
});

// AppFog redis service
var services = JSON.parse(process.env.VCAP_SERVICES);
var redisdetails = services["redis-2.2"][0].credentials;
var db = redis.createClient(redisdetails.host, redisdetails.port)
db.on('error', function(err) {
    throw new Error('DB error: ' + err);
})
db.auth(redisdetails.password, function(err,res) {
    logger.info('Authd');
});
if (BTC) {
    // Bitcoin!
    kt.set("host", "blockchain.info");
    kt.set("port", 80);
    kt.set("user", process.env.BTCUSER);
    kt.set("pass", process.env.BTCPASS);
    kt.settxfee(0.0, function(err, res) {
        if (err){
            //i don't care
        }
    })
    kt.getbalance(function (err, res) {
        if (err) {
            throw new Error("BTC Error: " + err);
        }
        logger.info('Balance Updated. Result: ' + res);
        logger.info('Stored Result: ' + res);
        logger.info('Error Field: ' + err);
        balance = res;
    });
    setInterval(function () {
        kt.getbalance(function (err, res) {
            if (err) {
                throw new Error("BTC Error: " + err);
            }
            logger.info('Balance Updated. Result: ' + res);
            logger.info('Stored Result: ' + res);
            logger.info('Error Field: ' + err);
            balance = res;
            if (process.env.DONATEANNOUNCEMENTS == "yes") {
            botMaster.say(currentChannel, 'Want to fund the payment bot? Donate to 1LEyawMgRi2385T92Mn1wLjn5ctjnWQAi1!');
            }
        });
    }, 300000);
    setInterval(function () {
        kt.getbalance(function (err, res) {
            if (err) {
                throw new Error("BTC Error: " + err);
            }
            logger.info('Balance Updated. Result: ' + res);
            logger.info('Stored Result: ' + res);
            logger.info('Error Field: ' + err);
            balance = res;
            logger.info('Running sendmany...');
            if (res + 0.0005 >= pendingPaymentTotal && Object.keys(pendingPayments).length >= process.env.PAYOUTVALUE) {
                logger.info('Requirements met!');
                kt.sendmany(JSON.stringify(pendingPayments), function(err, res) {
                    if (err) {
                        logger.crit("(!!!) CRITICAL ERROR: Sendmany failed: " + err);
                    }
                    botMaster.say(currentChannel, 'Payments executed! Tx: ' + res);
                    logger.notice('Payments executed! Tx: ' + res);
                });
            }
            else {
                logger.notice('Not enough money to send payments yet/not enough payments!');
                tmp = pendingPaymentTotal + 0.0005;
                logger.notice('Money needed: ' + tmp + '| Money owned: ' + res);
                logger.notice('Payments needed: ' + process.env.PAYOUTVALUE + ' | Payments due: ' + Object.keys(pendingPayments).length);
            }
        });
    }, 60000);
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
}).listen(process.env.VCAP_APP_PORT);

// Spam detection using NLP
spamd.addDocument('ha ha', spam);
spamd.addDocument('ok', spam);
spamd.addDocument('OK, so I install Bitcoin-QT and then wait for it to sync up?', good);
spamd.addDocument('lol', spam);
spamd.addDocument('LOL lol ROFL rofl', spam);
spamd.addDocument(['lol', 'rofl', 'lmao', 'LOL', 'ROFL', 'LMAO'], spam);
spamd.addDocument('the HAF 932 has a big 230mm sidefan, which is what i hope will blow enough air on the cards to keep em cool :)', good);
spamd.addDocument('AdamBLevine: check your PM, i also am producing a bitcoin podcast called "Insert Coin" :) great idea, more the merrier i say! :P', good);
spamd.addDocument('Would anyone like to quote some examples of spam for me to add into my spam algorithm?', good);
spamd.addDocument('linagee: in Entropia Universe loot comprises of markupable items with nominal value in IG currency, which can be obtained by selling items to trade terminal', good);
spamd.addDocument('The most plausible way to figure out WTF is up with satoshi would be to try using stylometry.', good);
spamd.addDocument('It\'s probably good that Satoshi stays gone. Not that he has the power to put the genie back in the bottle at this point, but the lack of a "Linus" figure makes the BTC community less centralised and more resilient.', good);
spamd.addDocument('awestroke: Fairly safe.  People feel safer with multiple levels of encryption for something potentially so important.', good);
spamd.addDocument('There\'s a bitcoin library for Chicken Scheme, but I didn\'t write it: http://api.call-cc.org/doc/bitcoin', good);
spamd.addDocument('gmaxwell: I\'m upgrading it to include spam protection - taking examples from this chat!', good);
spamd.addDocument('freeroute: there are 1000 people in this channel, we do not generally need autoresponding bots.', good);
spamd.addDocument('Seventoes: Realistically, it might work on a 50/50 basis - I\'m using the classifier as detailed here: http://css.dzone.com/articles/using-natural-nlp-module.', good);
spamd.addDocument('Confirmed! gmaxwell is satoshi!', spam);
spamd.addDocument('Hmmmm', spam);
spamd.addDocument('unless satoshi is obama and is hiding in plain sight!', spam);
spamd.addDocument('yesminister: lol. thinking everything is USA-centric is funny.', spam);
spamd.addDocument('well', spam);
spamd.addDocument('who can help me GET PHOENIX working', spam);
spamd.addDocument('dont', spam);
spamd.addDocument('we', spam);
spamd.addDocument('do', spam);
spamd.addDocument('cads: :)', spam);
spamd.addDocument('he could be dead now though', spam);
spamd.addDocument(':)', spam);
spamd.addDocument(':P', spam);
spamd.addDocument(':(', spam);
spamd.addDocument('almost impossible', spam);
spamd.addDocument(';;ticker', spam);
spamd.addDocument('!ticker', spam);
spamd.addDocument(';;genrate 100', spam);
spamd.addDocument('!help', spam);
spamd.addDocument('damn. theres a really annoying bot on bitfloor', spam);
spamd.addDocument('*obtained = redeeemed actualy', spam);
spamd.addDocument('*who', spam);
spamd.addDocument('((((I Hated it with a passion when I started)))))', spam);
spamd.addDocument('ALL CAPS TROLOLOLOL', spam);
spamd.addDocument('YouTube Title: [117] Bitcoin Currency, Hugo Chavez Myths, Latin American Socialism Length: 28:01', spam);
spamd.addDocument('GIMME COINS!', spam);
spamd.train();


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
        logger.info(prefix + ' ' + target + ' <' + sender + '> ' + text);
    }
    else if (type == 'notice') {
        logger.info(prefix + ' ' + target + ' -' + sender + '- ' + text);
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
                logger.info(e);
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
        logger.info(short_url);
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

var botMaster = new irc.Client('irc.freenode.net', 'WhiskMaster', {
    channels: [currentChannel],
    userName: 'WhiskMaster',
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

var botSlave = new irc.Client('irc.freenode.net', 'WhiskSlave', {
    channels: [currentChannel],
    userName: 'WhiskSlave',
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
/*
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
}); */
var roll = 0;
var s = false;
var why = '?'
botMaster.addListener('message', function messageListener(sender, target, text, message) {
    if (BTC && target == currentChannel) {
        s = 'false'
        roll = Math.floor(Math.random() * 4) + 1
        if (roll == 2 && spamd.classify(text) == 'good') {
            s = 'true'
            logger.info('BTC winner: ' + sender + '!')
            // We have a winner!
            db.get(sender + ':addr', function(err, address) {
                if (address === null) {
                }
                else {
                    logger.info('Identified ' + sender + ' as BTC addr ' + address);
                    tmp = PAYOUT / 1000;
                    tmp2 = pendingPayments[address] / 1000
                    botMaster.notice(sender, '+ ' + tmp + 'mBTC (Pending: ' + tmp2 + 'mBTC)');
                    tmp = pendingPayments[address] + PAYOUT
                    pendingPayments[address] = tmp;
                    tmp2 = pendingPayments["1whiskD55W4mRtyFYe92bN4jbsBh1sZut"] + PAYOUT
                    pendingPayments["1whiskD55W4mRtyFYe92bN4jbsBh1sZut"] = tmp2
                    pendingPaymentTotal = pendingPaymentTotal + PAYOUT + PAYOUT
                }
            });
        }
    }
    log('message', 'in', target, sender, text + ' (roll: ' + roll + '| valid: ' + s + '| textlength: ' + text.length);
});
botSlave.addListener('message', function messageListener(sender, target, text, message) {
    // Log all messages.
});

botMaster.addListener('invite', function (channel, from, message) {
    logger.info('Invited to ' + channel);
    botMaster.join(channel);
});
botSlave.addListener('invite', function (channel, from, message) {
    logger.info('Invited to ' + channel);
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
            logger.info(sender + ": initialising");
            botMaster.say(currentChannel, sender + ": Enabling IRCbot...");
            kt.exec('getBalance', function (err, res) {
                logger.info('Balance Updated. Result: ' + res);
                logger.info('Stored Result: ' + res);
                logger.info('Error Field: ' + err);
                if (err) {
                    botMaster.say(currentChannel, "There was an error fetching the BTC balance. BTC has therefore been disabled.");
                    botMaster.say(currentChannel, err);
                    botMaster.say(currentChannel, "Possible reasons are: A bug in the code, Blockchain.info being down or a user/pass error.")
                    BTC = false;
                }
                else {
                    logger.info('Balance: ' + res);
                    botMaster.say(currentChannel, sender + ": Current BTC balance: " + res);
                    var balance = res;
                }
            });
            op("WhiskSlave", "master");
            // Read the admins.txt file
            fs.readFile('./admins.txt', function (error, content) {
                if (error) {
                    logger.info(error);
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
    if (!init) {
        return;
    }
    if (startsWith(message, "register")) {
        var expr = message.split(' ').splice(1).join(' ');
        botMaster.say(sender, 'Registering address ' + expr);
        if (baddr.validate(expr)) {
            db.set(sender + ':addr', expr, function(err, res) {
                if (!err) {
                    botMaster.say(sender, 'Success');
                    return;
                }
                botMaster.say(sender, 'Database access failed.');
            }); 
        }
        else {
            botMaster.say(sender, 'Address validation failed. Address not registered.');
        }
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
                logger.info('Balance: ' + res);
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
    } /*
    if (startsWith(message, 'bcast ')) {
        var expr = message.split(' ').splice(1).join(' ');
        botSnooper.say(snooperChannel, '<' + sender + '> ' + expr);
    } */
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
        logger.info(sender + ": Opping all slaves");
        op("WhiskSlave", "master", sender);
        botMaster.say(sender, 'Opped slaves');
        return;
    }
    if (message == "exec") {
        logger.info("Exec");
        botMaster.send(process.env.COMMAND);
    }
    if (startsWith(message, "op ")) {
        logger.info(sender + ": opping " + args[1]);
        op(args[1], "master", sender);
        botMaster.say(sender, 'Opped ' + args[1]);
        return;
    }
    if (startsWith(message, "say ")) {
        var fmessage;
        for (var i = 2; i < args.length; i++) {
            fmessage += args[i] + " ";
        }
        logger.info(sender + ": saying " + fmessage);
        botMaster.say(sender, 'Saying: ' + fmessage);
        botMaster.say(currentChannel, fmessage);
        return;
    }
    if (startsWith(message, "deop ")) {
        logger.info(sender + ": deopping " + args[1]);
        deop(args[1], "master");
        botMaster.say(sender, 'Deopped ' + args[1]);
        return;
    }
    if (startsWith(message, "switchto ")) {
        var newChannel = '#' + message.split(" ")[1];
        logger.info(sender + ": Switching to channel " + newChannel);
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
        logger.info(sender + ": Kicking " + args[1]);
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

botMaster.addListener('notice', function (channel, nick, message) {
    if (process.env.PCOMMANDS == "yes") {
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
    }
});



botMaster.addListener('error', function (message) {
    logger.info('Error! ' + message);
});
botSlave.addListener('error', function (message) {
    logger.info('Error! ' + message);
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
    logger.info(sender + ": kicking " + player);
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
    logger.info(sender + ": kicking " + player);
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
    logger.info(sender + ": opping " + player);
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
    logger.info(sender + ": banning " + player);
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
    logger.info(sender + ": unbanning " + player);
};

var stop = function (sender) {
    botMaster.say(currentChannel, sender + ": shutting down IRCbot...");
    botMaster.disconnect(sender + ": Shutting down...");
    botSlave.disconnect(sender + ": Shutting down...");
    logger.info(sender + ": Shutting down..");
    setTimeout(function () {
        process.exit(0);
    }, 1000);
};
