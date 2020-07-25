const dotenv = require('dotenv');
const env = dotenv.config()
if (env.error) {
    throw env.error
}
const Discord = require('discord.js');
const express = require('express')
const mongo = require('mongodb')
const body_parser = require('body-parser');
const circus = require('./circus');
const help = require('./help');
const app = express()
const dbhost = process.env.FGBOT_DB_HOST
const dbport = process.env.FGBOT_DB_PORT
const dbauth = process.env.FGBOT_DB_AUTH_STRING
const ip = process.env.FGBOT_BOT_LISTEN_IP
const port = process.env.FGBOT_BOT_LISTEN_PORT
const account = "test_account"
var currentSession = -1;

var client = new mongo.MongoClient("mongodb://" + process.env.FGBOT_DB_AUTH_STRING + process.env.FGBOT_DB_HOST + ":" + process.env.FGBOT_DB_PORT, { useUnifiedTopology: true });
const bot = new Discord.Client();

const gVersion="v0.6.5 (Beta)"
const gUpdated="July 23rd, 2020"

console.log("************************************************");
console.log("*     GROGNARD FANTASY GROUNDS/DISCORD BOT     *");
console.log("*            VERSION v0.6.4 (Beta)             *");
console.log("************************************************");

var db;
var gPlayer;
var gPlayerDB;

app.use(body_parser.json());

bot.login(process.env.FGBOT_DISCORD_BOT_TOKEN);

bot.on('ready', function () {
    console.log("Logged in as " + bot.user.tag);
    app.listen(port, ip, () => console.log(`App listening at http://${ip}:${port}`))
});

client.connect(function (err) {
    if (err) throw err;
    console.log("DB Connected!");
    db = client.db(process.env.FGBOT_DB_NAME);
    const collection = db.collection(account + "_currentsession");
    console.log(collection);
    collection.find({}).toArray(function (err, doc) {
        currentSession = doc[0].current_session;
        currentSessionTime = doc[0].start_time;
        console.log("Current Session: " + currentSession)

        //Init Circus
        circus.registerRoutes(app, db, account);
    })
});

function getName(name) {
    for (var i = 0; i < gPlayerDB.length; i++) {
        if (gPlayerDB[i].discord == name)
            return " **" + gPlayerDB[i].owner + "**";
    }

    return "";
}

function getCharacterName(name) {
    for (var i = 0; i < gPlayerDB.length; i++) {
        if (gPlayerDB[i].owner == name)
            return gPlayerDB[i].character;
    }

    return name;
}

//Returns 0 if unathorized, 1 if GM, and 2 if a player
function checkAuth(discordName, callback) {
    const collection = db.collection(account + '_users');
    collection.findOne({ _id: 1 }, function (err, doc) {
        gPlayerDB = doc.players;
        if (doc.gm === discordName) {
            callback(1);
            return;
        }

        for (var i = 0; i < doc.players.length; i++) {
            if (doc.players[i].discord === discordName) {
                gPlayer = i;
                callback(2);
                return;
            }
        }

        callback(0);
        return;
    });
}

function getDiscord(characterName, callback) {
    const collection = db.collection(account + '_users');
    collection.findOne({ _id: 1 }, function (err, doc) {
        for (var i = 0; i < doc.players.length; i++) {
            if (doc.players[i].character === characterName) {
                callback(doc.players[i].discord);
                return;
            }
        }
        callback("");
    });
}

function getCharacter(discordName, callback) {
    const collection = db.collection(account + '_users');
    collection.findOne({ _id: 1 }, function (err, doc) {
        for (var i = 0; i < doc.players.length; i++) {
            if (doc.players[i].discord === discordName) {
                callback(doc.players[i].character);
                return;
            }
        }
        callback("");
    });
}

function getOwner(discordName, callback) {
    const collection = db.collection(account + '_users');
    collection.findOne({ _id: 1 }, function (err, doc) {
        for (var i = 0; i < doc.players.length; i++) {
            if (doc.players[i].discord === discordName) {
                callback(doc.players[i].owner);
                return;
            }
        }
        callback("");
    });
}

function getWholePercent(percentFor,percentOf)
{
    if (percentOf == 0) return 0;
    return Math.floor(percentFor/percentOf*100);
}

bot.on('message', message => {
    //Ignore our own messages
    if (message.author.tag === bot.user.tag) return;
    checkAuth(message.author.tag, function (level) {
        if (level === 0 && (message.content.startsWith('!') || message.channel.type == 'dm')) {
            message.channel.send("I'm sorry my friend... No GM has authorized me to help you. :frowning2:");
            return;
        }

        if (message.content === '!version') {
            const embed = {
                "title": "GROGNARD BOT",
                "description": "I love to watch [Fantasy Grounds](https://www.fantasygrounds.com) Pathfinder 2E Adventures and record all the events and stats I see. \n\n**!help** for a full command list.",
                "color": 12452095,
                "timestamp": new Date(),
                "footer": {
                    "icon_url": bot.user.avatarURL(),
                    "text": "© Cupcakus"
                },
                "fields": [
                    {
                        "name": "VERSION INFO",
                        "value": gVersion
                    },
                    {
                        "name": "AUTHOR",
                        "value": "Cupcakus"
                    },
                    {
                        "name": "LAST UPDATE",
                        "value": gUpdated
                    }
                ]
            };

            message.channel.send({ embed });
        }

        if (level == 2 && message.content.startsWith("!") && message.channel.type != 'dm') {
            message.channel.send("I can probably help you with that, but please ask me in a DM instead so we don't clutter up this channel.");
            return;
        }

        if (level == 2 && message.content.startsWith("!") && message.channel.type == 'dm') {
            console.log(message.author.tag + " is asking me " + message.content);
        }

        //Send the message to the circus module
        circus.onMessage(message, bot, db, account);
        help.onHelp(message, bot);

        if (message.content.startsWith('!register')) {
            if (level != 1) {
                message.channel.send("Sorry friend... Only GM's have the power to subscribe me to channels.");
                return;
            }
            if (message.channel.type != 'text') {
                message.channel.send("Sorry friend... I can only post to text channels right now.  Register me there instead.");
                return;
            }
            const collection = db.collection(account + '_channels');

            var payload = {
                _id: message.channel.id,
                registered_date: new Date()
            }
            collection.find({ _id: payload._id }).toArray(function (err, docs) {
                if (docs.length != 0) {
                    message.channel.send("This channel is already registered! What are you trying to pull here?");
                    return;
                }
                collection.insertOne(payload, function (err, result) {
                    if (err) throw err
                    message.channel.send("OK, this channel is registered!");
                });
            });
        }

        if (message.content.startsWith('!stats')) {
            var currentStats = {};
            const users = db.collection(account + "_users");
            users.findOne({_id:1}, function(err, doc) {
                currentStats.campaign = doc.name;
                currentStats.start = new Date(doc.start).toLocaleDateString();
                getCharacter(message.author.tag, function(char) {
                    currentStats.character = char;
                    const rolls = db.collection(account + "_dierolls");
                    rolls.distinct("session", function(err, array) {
                        currentStats.sessions = array.length;
                        getOwner(message.author.tag, function(owner) {
                            rolls.count({user: owner}, function(err, count) {
                                currentStats.attendance = count;
                                const mdks = db.collection(account + "_mdks");
                                mdks.count({},function(err, mdkcount) {
                                    currentStats.killed = mdkcount;
                                    mdks.find({source: char}).toArray(function(err, kills) {
                                        currentStats.killedbyyou = kills.length;
                                        var crit = 0;
                                        for (var i=0;i < kills.length;i++) {
                                            if (kills[i].critical == "YES")
                                                crit++;
                                        }
                                        currentStats.critical = crit;
                                        const embed = {
                                            "content": "Here is your current stats report:",
                                            "embed": {
                                              "color": 16471240,
                                              "timestamp": "2020-05-26T18:53:16.506Z",
                                              "footer": {
                                                "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
                                                "text": "footer text"
                                              },
                                              "fields": [
                                                {
                                                  "name": "CAMPAIGN INFO",
                                                  "value": "**Current Campaign:** "+currentStats.campaign+"\n**Campaign Start:** "+currentStats.start+"\n**Total Sessions:** "+currentStats.sessions+"\n**Your Attendance:** "+currentStats.attendance+" ("+getWholePercent(currentStats.attendance, currentStats.sessions)+"%)\n**Current Character:** "+currentStats.character
                                                },
                                                {
                                                  "name": "COMBAT EFFECTIVENESS",
                                                  "value": "**Total Enemies Killed:** "+currentStats.killed+"\n**Killed By You:** "+currentStats.killedbyyou+" ("+getWholePercent(currentStats.killedbyyou, currentStats.killed)+"%)\n**Killed By You Critical:** "+currentStats.critical+" ("+getWholePercent(currentStats.critical, currentStats.killedbyyou)+"%)"
                                                },
                                                {
                                                  "name": "YOUR OVERALL ROLL STATS",
                                                  "value": "COMING SOON!"
                                                }
                                              ]
                                            }
                                          }
                                          message.channel.send(embed);
                                    });
                                })
                            });
                        });                        
                    })
                })
            })
        }

        if (message.content.startsWith('!rolls')) {
            var querySession = currentSession;

            if (message.content.indexOf(" ") > 0) {
                //User wants a specific session...
                querySession = message.content.substr(message.content.indexOf(" ") + 1);
            }

            var query = {
                session: querySession
            }

            const collection = db.collection(account + '_dierolls');
            collection.find({ session: querySession }).toArray(function (err, docs) {
                if (docs.length == 0) {
                    if (querySession === currentSession) {
                        message.channel.send("I don't seem to have any statistics right now... You'll have to play first.");
                    } else {
                        message.channel.send("I don't seem to have any statistics for you for that session, I'm sorry.");
                    }
                    return;
                }

                if (level == 2) {
                    var bStop = true;
                    docs.forEach(function (doc, index) {
                        if (doc.user == gPlayerDB[gPlayer].owner) {
                            bStop = false;
                        }
                    });
                    if (bStop) {
                        if (querySession === currentSession) {
                            message.channel.send("I don't seem to have any statistics for you right now... You'll have to play first.");
                        } else {
                            message.channel.send("I don't seem to have any statistics for you for that session, I'm sorry.");
                        }
                        return;
                    }
                }

                message.channel.send("Here are the die roll statistics for the **Pathfinder 2E** Session **#" + querySession + "**");

                //Check for achievements
                var obj20s = { num: 0, user: "" }
                var obj1s = { num: 0, user: "" }
                var objHigh = { num: 0, user: "" }
                var objLow = { num: 0, user: "" }
                var objMost = { num: 0, user: "" }
                var objLeast = { num: 99999999, user: "" }

                docs.forEach(function (doc, index) {

                    //GM's cannot earn achievements, no achievement previews...
                    if (doc.user.indexOf("(GM)") <= 0) {

                        var crits = 0;
                        var miss = 0;
                        var high = 0;
                        var low = 0;
                        var total = 0;
                        for (var i = 0; i < doc.dierolls.d20.length; i++) {
                            if (doc.dierolls.d20[i] == '20') crits++;
                            if (doc.dierolls.d20[i] == '1') miss++;
                            total++;
                        }

                        for (var i = 0; i < doc.dierolls.d12.length; i++) {
                            if (Number(doc.dierolls.d12[i]) > 8) high++;
                            if (Number(doc.dierolls.d12[i]) > 5) low++;
                            total++;
                        }

                        for (var i = 0; i < doc.dierolls.d10.length; i++) {
                            if (Number(doc.dierolls.d10[i]) > 7) high++;
                            if (Number(doc.dierolls.d10[i]) < 4) low++;
                            total++;
                        }

                        for (var i = 0; i < doc.dierolls.d8.length; i++) {
                            if (Number(doc.dierolls.d8[i]) > 5) high++;
                            if (Number(doc.dierolls.d8[i]) < 4) low++;
                            total++;
                        }

                        for (var i = 0; i < doc.dierolls.d6.length; i++) {
                            if (Number(doc.dierolls.d6[i]) > 3) high++;
                            if (Number(doc.dierolls.d6[i]) < 4) low++;
                            total++;
                        }

                        for (var i = 0; i < doc.dierolls.d4.length; i++) {
                            if (Number(doc.dierolls.d4[i]) > 2) high++;
                            if (Number(doc.dierolls.d4[i]) < 3) low++;
                            total++;
                        }

                        if (crits > obj20s.num) {
                            obj20s.num = crits;
                            obj20s.user = doc.user;
                        }

                        if (miss > obj1s.num) {
                            obj1s.num = miss;
                            obj1s.user = doc.user;
                        }

                        if (high > objHigh.num) {
                            objHigh.num = high;
                            objHigh.user = doc.user;
                        }

                        if (low > objLow.num) {
                            objLow.num = low;
                            objLow.user = doc.user;
                        }

                        if (total > objMost.num) {
                            objMost.num = total;
                            objMost.user = doc.user;
                        }

                        if (total < objLeast.num && total >= 20) {
                            objLeast.num = total;
                            objLeast.user = doc.user;
                        }
                    }
                });
                docs.forEach(function (doc, index) {
                    if (level == 2 && doc.user != gPlayerDB[gPlayer].owner) return;

                    var d20 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    var d12 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    var d10 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    var d8 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    var d6 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    var d4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

                    //d20
                    for (var i = 0; i < doc.dierolls.d20.length; i++) {
                        d20[Number(doc.dierolls.d20[i]) - 1]++;
                    }
                    if (doc.dierolls.d20.length) {
                        for (var i = 0; i < 20; i++) {
                            d20[i] = Math.floor((d20[i] / doc.dierolls.d20.length) * 100);
                        }
                    }
                    //d12
                    for (var i = 0; i < doc.dierolls.d12.length; i++) {
                        d12[Number(doc.dierolls.d12[i]) - 1]++;
                    }
                    if (doc.dierolls.d12.length) {
                        for (var i = 0; i < 12; i++) {
                            d12[i] = Math.floor((d12[i] / doc.dierolls.d12.length) * 100);
                        }
                    }
                    //d10
                    for (var i = 0; i < doc.dierolls.d10.length; i++) {
                        d10[Number(doc.dierolls.d10[i]) - 1]++;
                    }
                    if (doc.dierolls.d10.length) {
                        for (var i = 0; i < 10; i++) {
                            d10[i] = Math.floor((d10[i] / doc.dierolls.d10.length) * 100);
                        }
                    }
                    //d8
                    for (var i = 0; i < doc.dierolls.d8.length; i++) {
                        d8[Number(doc.dierolls.d8[i]) - 1]++;
                    }
                    if (doc.dierolls.d8.length) {
                        for (var i = 0; i < 8; i++) {
                            d8[i] = Math.floor((d8[i] / doc.dierolls.d8.length) * 100);
                        }
                    }
                    //d6
                    for (var i = 0; i < doc.dierolls.d6.length; i++) {
                        d6[Number(doc.dierolls.d6[i]) - 1]++;
                    }
                    if (doc.dierolls.d6.length) {
                        for (var i = 0; i < 6; i++) {
                            d6[i] = Math.floor((d6[i] / doc.dierolls.d6.length) * 100);
                        }
                    }
                    //d4
                    for (var i = 0; i < doc.dierolls.d4.length; i++) {
                        d4[Number(doc.dierolls.d4[i]) - 1]++;
                    }
                    if (doc.dierolls.d4.length) {
                        for (var i = 0; i < 4; i++) {
                            d4[i] = Math.floor((d4[i] / doc.dierolls.d4.length) * 100);
                        }
                    }

                    const embed =
                    {
                        "title": `__Die roll statistics for **${getCharacterName(doc.user)}**__`,
                        "color": 12452095,
                        "timestamp": new Date(),
                        "footer": {
                            "icon_url": bot.user.avatarURL(),
                            "text": "© Cupcakus"
                        },
                        "fields": []
                    }

                    if (doc.dierolls.d20.length) {
                        embed.fields.push({
                            "name": "D20 <:d20:696099654655279117>",
                            "value": `**TOTAL ROLLS: ${doc.dierolls.d20.length}**\n**20:** ${d20[19]}%  **19:** ${d20[18]}%  **18:** ${d20[17]}%  **17:** ${d20[16]}%  **16:** ${d20[15]}%  **15:** ${d20[14]}%  **14:** ${d20[13]}%  **13:** ${d20[12]}%  **12:** ${d20[11]}%  **11:** ${d20[10]}%\n **10:** ${d20[9]}%** 9:** ${d20[8]}%  **8:** ${d20[7]}%  **7:** ${d20[6]}%  **6:** ${d20[5]}%  **5:** ${d20[4]}%  **4:** ${d20[3]}%  **3:** ${d20[2]}%  **2:** ${d20[1]}%  **  1:** ${d20[0]}%\n`
                        });
                    }

                    if (doc.dierolls.d12.length) {
                        embed.fields.push({
                            "name": "D12 <:d12:696099651128131739>",
                            "value": `**TOTAL ROLLS: ${doc.dierolls.d12.length}**\n**12:** ${d12[11]}%  **11:** ${d12[10]}%  **10:** ${d12[9]}%  **9:** ${d12[8]}%  **8:** ${d12[7]}%  **7:** ${d12[6]}%\n**6:** ${d12[5]}%  **5:** ${d12[4]}%  **4:** ${d12[3]}%  **3:** ${d12[2]}%  **2:** ${d12[1]}%  **1:** ${d12[0]}%`
                        });
                    }

                    if (doc.dierolls.d10.length) {
                        embed.fields.push({
                            "name": "D10 <:d10:696099650872279190>",
                            "value": `**TOTAL ROLLS: ${doc.dierolls.d10.length}**\n**10:** ${d10[9]}%  **9:** ${d10[8]}%  **8:** ${d10[7]}%  **7:** ${d10[6]}% **6:** ${d10[5]}%  **5:** ${d10[4]}%  **4:** ${d10[3]}%  **3:** ${d10[2]}%  **2:** ${d10[1]}%  **1:** ${d10[0]}%`
                        });
                    }

                    if (doc.dierolls.d8.length) {
                        embed.fields.push({
                            "name": "D8 <:d8:696099652579098677>",
                            "value": `**TOTAL ROLLS: ${doc.dierolls.d8.length}**\n**8:** ${d8[7]}%  **7:** ${d8[6]}% **6:** ${d8[5]}%  **5:** ${d8[4]}%  **4:** ${d8[3]}%  **3:** ${d8[2]}%  **2:** ${d8[1]}%  **1:** ${d8[0]}%`
                        });
                    }

                    if (doc.dierolls.d6.length) {
                        embed.fields.push({
                            "name": "D6 <:d6:696099646937759854>",
                            "value": `**TOTAL ROLLS: ${doc.dierolls.d6.length}**\n**6:** ${d6[5]}%  **5:** ${d6[4]}%  **4:** ${d6[3]}%  **3:** ${d6[2]}%  **2:** ${d6[1]}%  **1:** ${d6[0]}%`
                        });
                    }

                    if (doc.dierolls.d4.length) {
                        embed.fields.push({
                            "name": "D4 <:d4:696099646359076864>",
                            "value": `**TOTAL ROLLS: ${doc.dierolls.d4.length}**\n**4:** ${d4[3]}%  **3:** ${d4[2]}%  **2:** ${d4[1]}%  **1:** ${d4[0]}%`
                        });
                    }

                    //No achievements unless the GM asks for rolls, OR the session is old
                    if (level == 1 || querySession != currentSession) {
                        //Apply achievements...
                        var str = ""
                        if (obj20s.user == doc.user) {
                            str = str + ":star: **DOUBLE DESTRUCTION** (Most 20s on a D20)\n";
                        }
                        if (obj1s.user == doc.user) {
                            str = str + ":star: **PAID TIME OFF** (Most 1s on a D20)\n";
                        }
                        if (objHigh.user == doc.user) {
                            str = str + ":star: **HULK SMASH!** (Best rolls outside of D20)\n";
                        }
                        if (objLow.user == doc.user) {
                            str = str + ":star: **SNAKE EYES** (Worst rolls outside of D20)\n";
                        }
                        if (objMost.user == doc.user) {
                            str = str + ":star: **BIG ROLLER** (Most total rolls)\n";
                        }
                        if (objLeast.user == doc.user) {
                            str = str + ":star: **OLD BONES** (Least total rolls)\n";
                        }

                        if (str.length > 0) {
                            embed.fields.push({
                                "name": "***ACHIEVEMENTS***",
                                "value": str
                            });
                        }
                    }
                    message.channel.send({ embed });
                });
            });
        }

        if (message.content.startsWith('!unregister')) {
            if (level != 1) {
                message.channel.send("Sorry friend... Only GM's have the power to unsubscribe me to channels.");
                return;
            }
            const collection = db.collection(account + '_channels');

            collection.find({ _id: message.channel.id, }).toArray(function (err, docs) {
                if (docs.length > 0) {
                    collection.deleteOne({ _id: message.channel.id }, function (err) {
                        message.channel.send("You got it boss! I'll refrain from sending any more messages to this channel.");
                    });
                }
                else {
                    message.channel.send("I know I can be annoying... but I wasn't even registered to talk here anyway!");
                }
            });
        }

        if (message.content.startsWith('!clear')) {
            if (level != 1) {
                message.channel.send("Sorry friend... Only GM's have the power to clear my channels.");
                return;
            }

            const collection = db.collection(account + '_channels');
            collection.deleteMany({}, function (err) {
                message.channel.send("I've deleted my entire channel registry for this server... Don't ever say I didn't do anything for **you!**");
            });
        }
    });
});

var crit_messages = [
    "WOW!!!!!! **%1** just OBLITERATED that *%2* with a **%3** CRITICAL HIT for an amazing **%4** Damage!!!",
    "If I knew that a **%3** could do **%4** damage on a CRITICAL HIT I would never have trusted it in **%1's** hands.  RIP *%2*!",
    "Where did that come from?! **%1** just destroyed a *%2* with **%4** damage from a **%3** CRITICAL HIT!!!",
    "If I wasn't a bot, I would totally buy that **%3** from you **%1**!  **%4** damage to a *%2* on a CRITICAL HIT? Just... wow!",
    "Should I call you **%1**? Or is it LEEEEEEROOOOY JEEEEEENKINSSSSS?!! That *%2* never saw it coming.  **%3** CRITICAL HIT for **%4** Damage!",
    "I look away for one moment, and the *%2* is gone from the map! Where did it go?... OH! **%1** DECIMATED it with a **%3** for **%4** damage CRITICAL HIT!",
    "Roses are red... Violets are blue... **%1** has a **%3** and the *%2* bit off more than it could chew!!! **%4** damage on a CRITICAL HIT!",
    "I hope **%1** isn't a millenial, or they might feel like they're ENTITLED to all these CRITICAL HITS! The *%2* is down, from a **%3** for **%4** Damage!",
    "Can someone please help **%1** with all this TALENT? There goes a *%2*, destroyed by a CRITICAL HIT from a **%3** for **%4** Damage!",
    "Here lies *%2*.  We hardly knew them.  Killed by **%1's** CRITICAL HIT with a **%3** for **%4** Damage! INSANE!"
]

var messages = [
    "Can you believe **%1** just killed that *%2* with a **%3**?.. **%4** Total Damage!",
    "Someone grab the mop! **%1** just dropped a *%2* to the floor with a **%3**.. **%4** Total Damage!",
    "What kind of bot would I be if I didn't give credit to **%1** for killing that *%2* with their **%3**.  CONGRATS! **%4** Total Damage!",
    "Don't look now, but I think **%1** is stealing kills! Chalk up that *%2* as another one! Smashed with a **%3** for **%4** Damage!",
    "After all that hard work **%1** just ended the story for that *%2*. Farewell my fiendish friend! Watch out for those **%3's** and the **%4** damage they can do in the afterlife!",
    "1.... 2.... 3.... 4.... Pick that *%2* up off the floor! One more kill for **%1** and their **%3**.  **%4** Total Damage!",
    "If you come at **%1**, you better come correct! There's one less *%2* in the world.  A **%3** took it out with **%4** damage!",
    "Be honest **%1**... Did you need to use a Hero Point to kill that *%2*? Killed with a **%3** for **%4** Total Damage!",
    "Behold! The mighty **%3**! wielded by none other than **%1**! Ended that *%2* in style!... **%4** Total Damage!",
    "Where there was a *%2* now there is none, and you have **%1** and their **%3** to thank for it.  Thanks! **%4** Total Damage!"
]

app.get('/mdk/:source/:target/:damage/:weapon/:critical', function (req, res) {
    const collection = db.collection(account + '_channels');
    collection.find({}).toArray(function (err, docs) {
        if (err) throw err;
        docs.forEach(function (doc, index) {
            bot.channels.fetch(doc._id).then(function (channel) {
                var str;
                if (req.params.critical == "YES") {
                    str = crit_messages[Math.floor(Math.random() * crit_messages.length)];
                }
                else {
                    str = messages[Math.floor(Math.random() * messages.length)];
                }
                str = str.replace("%1", req.params.source).replace("%2", req.params.target).replace("%3", req.params.weapon).replace("%4", req.params.damage);
                channel.send(str);
            });
        });
        getDiscord(req.params.source, function(discordName) {
            const mdk = db.collection(account + "_mdks")
            var mdkobj = {
                source: req.params.source,
                target: req.params.target,
                damage: req.params.damage,
                weapon: req.params.weapon,
                critical: req.params.critical,
                discord: discordName,
                session: currentSession
            };
            mdk.insertOne(mdkobj, function(err) {
                res.send('OK');
            });
        })
    });
});

function updateDieRolls(session, sender, user, dice, in_dierolls, collection, callback) {
    //Break down the dieroll string
    dice = dice.replace(new RegExp('p','g'), 'd');
    dice = dice.replace(new RegExp('g','g'), 'd');
    dice = dice + "d";
    while (dice.length > 1) {
        type = dice.substr(0, dice.indexOf(","));
        dice = dice.substr(dice.indexOf(",") + 1, dice.length);
        value = dice.substr(0, dice.indexOf("d"));
        dice = dice.substr(dice.indexOf("d"), dice.length);
        in_dierolls[type].push(value);
    }
    collection.updateOne({ session: session, user: user }, { $set: { dierolls: in_dierolls } }, function (err) {
        if (err) throw err;
        callback();
    });
}

app.get('/die/:session/:sender/:user/:dice', function (req, res) {
    if (req.params.session != currentSession) {
        const col = db.collection(account + "_currentsession");
        col.updateOne({ _id: 1 }, { $set: { current_session: req.params.session, start_time: new Date() } }, function (err) {
            console.log("Starting a new session: " + req.params.session);
            currentSession = req.params.session;

            const collection = db.collection(account + '_dierolls');
            collection.find({ session: req.params.session, user: req.params.user }).toArray(function (err, doc) {
                if (doc.length == 0) {
                    //This is a new session or user! Lets start a new record
                    var userRecord = {
                        session: req.params.session,
                        user: req.params.user,
                        dierolls: {
                            d4: [],
                            d6: [],
                            d8: [],
                            d10: [],
                            d12: [],
                            d20: []
                        }
                    }
                    collection.insertOne(userRecord, function (err) {
                        if (err) throw err;
                        updateDieRolls(req.params.session, req.params.sender, req.params.user, req.params.dice, userRecord.dierolls, collection, function (err) {
                            res.send('OK')
                        });
                    });
                } else {
                    updateDieRolls(req.params.session, req.params.sender, req.params.user, req.params.dice, doc[0].dierolls, collection, function (err) {
                        res.send('OK')
                    });
                }
            });
        });
    }
    else {
        const collection = db.collection(account + '_dierolls');
        collection.find({ session: req.params.session, user: req.params.user }).toArray(function (err, doc) {
            if (doc.length == 0) {
                //This is a new session or user! Lets start a new record
                var userRecord = {
                    session: req.params.session,
                    user: req.params.user,
                    dierolls: {
                        d4: [],
                        d6: [],
                        d8: [],
                        d10: [],
                        d12: [],
                        d20: []
                    }
                }
                collection.insertOne(userRecord, function (err) {
                    if (err) throw err;
                    updateDieRolls(req.params.session, req.params.sender, req.params.user, req.params.dice, userRecord.dierolls, collection, function (err) {
                        res.send('OK')
                    });
                });
            } else {
                updateDieRolls(req.params.session, req.params.sender, req.params.user, req.params.dice, doc[0].dierolls, collection, function (err) {
                    res.send('OK')
                });
            }
        });
    }
});

app.post('/users', function (req, res) {
    const collection = db.collection(account + "_users");
    collection.updateOne({ _id: 1 }, { $set: req.body }, function (err) {
        res.send('OK');
    })
});

app.get('/users', function (req, res) {
    const collection = db.collection(account + "_users");
    collection.findOne({ _id: 1 }, function (err, doc) {
        res.json(doc).status(200);
    })
});