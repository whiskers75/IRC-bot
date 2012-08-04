var irc = require('irc');


/*
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.setRawMode(true);
*/

var currentChannel = '##node-irc-bots';
var init = false;
var admins = ["Bux", "whiskers75"];
var fs = require("fs");
var nemesis = 'none';
var leader = 'whiskers75';
var secondLeader = 'Bux';
var welcomeFunction = 0;

var botMaster = new irc.Client('irc.freenode.net', 'IRCbot_Master', {
  channels: [currentChannel],
  userName: 'IRCbot_Master',
  realName: 'The Master IRC',
  port: 6667,
  debug: false,
  showErrors: false,
  autoRejoin: true,
  autoConnect: true,
  secure: false,
  selfSigned: false,
  certExpired: false,
  floodProtection: false,
  floodProtectionDelay: 1000,
  stripColors: false
});

var botSlave = new irc.Client('irc.freenode.net', 'IRCbot_Slave', {
  channels: [currentChannel],
  userName: 'IRCbot_Slave',
  realName: 'A slave IRC',
  port: 6667,
  debug: false,
  showErrors: false,
  autoRejoin: true,
  autoConnect: true,
  secure: false,
  selfSigned: false,
  certExpired: false,
  floodProtection: false,
  floodProtectionDelay: 1000,
  stripColors: false
});

botMaster.addListener('pm', function(sender, message) {
  var args = message.split(" ");
  if(message == "init"){
    if(!init) {
      if(!contains(admins, sender)){ return; }
      init = true;
      console.log(sender + ": initialising");
      botMaster.say(currentChannel, sender + ": Enabling IRCbot...");
      op("IRCbot_Slave", "master");
      // Read the admins.txt file
      fs.readFile('./admins.txt', function(error, content) {
        if(error) { console.log(error); return;}
        var line = line.split(content, "\r\n");
        for(i = 0; i < line.length; i++){
           admins[admins.length] == line;
        }
      });
      return;
	} else {
      botMaster.send('MSG', sender, 'Already initialised');
      return;
	}
  }
  if(message == "shutdown") {
    stop(sender);
  }
  
  if(!init){ return; }
  if(message == "opme") {
    console.log(sender + ": Opping " + sender);
    op(sender, "master", sender);
    return;
  }
  if(!contains(admins, sender)){ return; }
  
  if(message == "deinit") {
    botMaster.say(currentChannel, sender  + ": disabling IRCbot...");
	init = false;
  }
  if(message == "nemesis?") {
    botMaster.say(sender, nemesis);
  }
  if(message == "erase-nemesis") {
    nemesis = 'none';
  }
  if(message == "welcomeOn") {
    welcomeFunction = 1;
  }
  if(message == "welcomeOff") {
    welcomeFunction = 0;
  }
  if(message == "opslaves"){
    console.log(sender + ": Opping all slaves");
    op("IRCbot_Slave", "master", sender);
	return;
  }
  if(startsWith(message, "op ")) {
    console.log(sender + ": opping " + args[1]);
    op(args[1], "master", sender);
	return;
  }
  if(startsWith(message, "say ")) {
    var fmessage;
    for(var i = 2; i < args.length; i++){
      fmessage += args[i] + " ";
    }
    console.log(sender + ": saying " + fmessage);
    botMaster.say(currentChannel, fmessage);
    return;
  }
  if(startsWith(message, "deop ")) {
    console.log(sender + ": deopping " + args[1]);
    deop(args[1], "master");
	return;
  }
  if(startsWith(message, "switchto ")) {
    var newChannel = '#' + message.split(" ")[1];
    console.log(sender + ": Switching to channel " + newChannel);
    botMaster.part(currentChannel);
	botSlave.part(currentChannel);
	botMaster.join(newChannel);
	botSlave.join(newChannel);
	currentChannel = newChannel;
	return;
  }
  if(startsWith(message, "kick ")) {
    console.log(sender + ": Kicking " + args[1]);
    kick(args[1], args[2], "master", sender);
	return;
  }
  if(startsWith(message, "alist ")) {
    if(args[1] == "add"){
      var data = fs.createWriteStream('./admins.txt', {flags: "a", encoding: "utf-8", mode: 0666});
      data.write(args[2]);
      admins[admins.length] = args[2];
    } 
    else if(args[1] == "remove") {
      admins.splice(admins.indexOf(args[2]), 1);
      var newadmins = [];
      fs.readFile('./admins.txt', function(error, content) {
        var line = line.split(content, "\r\n");
        if(line != args[2]){
          newadmins[newadmins.length] = line;
        }
      });
      var newadminsws = fs.createWriteStream('./admins.txt', {flags: "a", encoding: "utf-8", mode: 0666});
      for(var ii = 0; ii < newadmins.length; ii++){
        newadminsws.write(newadmins[ii]);
      } 
    } 
    else {
      botMaster.send('MSG', sender, "syntax: alist <add/remove> [player]");
    }
  }
});

botMaster.addListener('join', function(channel, nick, message) {
  if(welcomeFunction = 1) {
      if((nick != "IRCbot_Master") && (nick != "IRCbot_Slave")){ botMaster.say(channel, "Welcome, " + nick + " to the Node.JS IRC"); }
  }
  if(nick == "IRCbot_Master") {
    botMaster.say('ops plz');
  } else if(nick == "IRCbot_Slave") {
    botSlave.say('ops plz');
  }
  setTimeout(function() {
  if(nick == leader) {
    botMaster.say(nick, 'Welcome, O most glorious and great leader!');
    botMaster.say(nick, 'Your current nemesis is: ' + nemesis);
    op(leader, "master", leader);
  }
  if(nick == secondLeader) {
    botMaster.say(nick, 'Welcome, O most glorious and great leader!');
    botMaster.say(nick, 'Your current nemesis is: ' + nemesis);
    op(secondLeader, "master", secondLeader);
  }
  }, 2400);
});

botMaster.addListener('message', function (from, to, message) {
  if(message == "opme" && init) { op(from, "master"); } 
});

////////////////////////////
////////////////////////////

botMaster.addListener('-mode', function(channel, by, mode, argument, message) {
  if(mode == 'o' && argument == "IRCbot_Slave"){ 
    botMaster.say('ops plz'); // for -oo 's
    op("IRCbot_Slave", "master", "IRCbot_Master");
	setTimeout(function() { ban(by, "Disconnected by admin.", "master","IRCbot_Master"); }, 1200);
    nemesis = by;
    botMaster.say(channel, by + ' added as nemesis.');
	botMaster.say(channel, by + " has been banned for deopping IRC bots!");
  } 
});
botSlave.addListener('-mode', function(channel, by, mode, argument, message) {
  if(mode == 'o' && argument == "IRCbot_Master") {
    botSlave.say('ops plz'); 
    op("IRCbot_Master", "slave", "IRCbot_Slave");
	setTimeout(function() { ban(by, "Disconnected by admin.", "slave", "IRCbot_Slave"); }, 1200);
    nemesis = by;
    botMaster.say(channel, by + ' added as nemesis.');
	botMaster.say(channel, by + " has been banned for deopping IRC bots!");
  }  
});
////
botMaster.addListener('+mode', function(channel, by, mode, argument, message) {
  if(mode == 'b' && argument == "IRCbot_Slave") {
    botMaster.send('MODE', channel, '-b', "IRCbot_Slave");
	ban(by, "Disconnected by admin.", "master", "IRCbot_Master");
    nemesis = by;
    botMaster.say(channel, by + ' added as nemesis.');
	botSlave.say(channel, by + " has been banned for attempting to ban IRC bots!");
  }
});
botSlave.addListener('+mode', function(channel, by, mode, argument, message) {
  if(mode == 'b' && argument == "IRCbot_Master") {
    unban("IRCbot_Master", "slave", "IRCbot_Slave");
	ban(by, "Disconnected by admin.", "slave", "IRCbot_Slave");
    nemesis = by;
    botMaster.say(channel, by + ' added as nemesis.');
	botSlave.say(channel, by + " has been banned for attempting to ban IRC bots!");
  }
});
////
botMaster.addListener('kick', function(channel, nick, by, reason, message) {
  if(nick == "IRCbot_Slave") {
	ban(by, "Kicking IRC bots.", "master", "IRCbot_Master");
    nemesis = by;
    botMaster.say(channel, by + ' added as nemesis.');
	botSlave.say(channel, by + " has been banned for kicking IRC bots!");
  }  
});
botSlave.addListener('kick', function(channel, nick, by, reason, message) {
  if(nick == "IRCbot_Master") {
    botSlave.send('ops plz');
	ban(by, "Kicking IRC bots.", "slave", "IRCbot_Slave");
    nemesis = by;
    botMaster.say(channel, by + ' added as nemesis.');
  }  
});

botMaster.addListener('message', function(channel, nick, message){
    if(message == "!rules") {
        botMaster.say(nick, 'Rules:');
        botMaster.say(nick, '1. No changing topics.');
        botMaster.say(nick, '2. ABSOLUTELY NO DEOPPING/KICKING/BANNING THE BOTS.');
        botMaster.say(nick, '3. No swearing.');
        botMaster.say(nick, 'End rules.');
    return;
  }
});



botMaster.addListener('error', function(message) {
  console.log(message);
});
botSlave.addListener('error', function(message) {
  console.log(message);
});


//////////////////////////////
//////////////////////////////

process.stdin.on('data', function(key) {
// listen for Ctrl + C
  if(key == '\3') {
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
if(!bot) { bot = "master"; }
if(!reason) { reason = "Disconnected by admin"; }

if(bot == "master"){
  botMaster.send('KICK', currentChannel, player, reason);
} else {
  botSlave.send('KICK', currentChannel, player, reason);
}
console.log(sender + ": kicking " + player);
};

var deop = function (player, bot, sender) {
if(!bot){ bot = "master"; }
if(bot == "master") {
  botMaster.send('MODE', currentChannel, '-o', player);
} else {
  botSlave.send('MODE', currentChannel, '-o', player);
}
console.log(sender + ": kicking " + player);
};

var op = function (player, bot, sender) {
if(!bot){ bot = "master"; }
if(bot == "master") {
  botMaster.send('MODE', currentChannel, '+o', player);
} else {
  botSlave.send('MODE', currentChannel, '+o', player);
}
console.log(sender + ": opping " + player);
};

var ban = function (player, reason, bot, sender) {
if(!bot) { bot = "master"; }
if(!reason) { reason = "Banned by admin."; }
if(bot == "master") {
  botMaster.send('MODE', currentChannel, '+b', player);
} else {
  botSlave.send('MODE', currentChannel, '+b', player);
}
console.log(sender + ": banning " + player);
};

var unban = function (player, bot, sender) {
if(!bot) { bot = "master"; }
if(bot == "master") {
  botMaster.send('MODE', currentChannel, '-b', player);
} else {
  botSlave.send('MODE', currentChannel, '-b', player);
}
console.log(sender + ": unbanning " + player);
};

var stop = function(sender){
  botMaster.say(currentChannel, sender  + ": shutting down IRCbot...");
  botMaster.disconnect(sender + ": Shutting down...");
  botSlave.disconnect(sender + ": Shutting down...");
  console.log(sender + ": Shutting down..");
  setTimeout(function(){ process.exit(0); }, 1000);
};
