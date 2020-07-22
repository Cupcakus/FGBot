const Discord = require('discord.js');
const express = require('express')
const mongo = require('mongodb')
const body_parser = require('body-parser');
const app = express()
const port = 3000
const account = "test_account"
var currentSession = -1;

var client = new mongo.MongoClient("mongodb://localhost:27017", { useUnifiedTopology: true });
const bot = new Discord.Client();

const gVersion="v0.6.4 (Beta)"
const gUpdated="June 2nd, 2020"

console.log("************************************************");
console.log("*     GROGNARD FANTASY GROUNDS/DISCORD BOT     *");
console.log("*            VERSION v0.6.4 (Beta)             *");
console.log("************************************************");

var db;
var gPlayer;
var gPlayerDB;

app.use(body_parser.json());

bot.login([SECRET_KEY]);

bot.on('ready', function () {
    console.log("Logged in as " + bot.user.tag);
    app.listen(port, () => console.log(`App listening at http://localhost:${port}`))
});

client.connect(function (err) {
    if (err) throw err;
    console.log("DB Connected!");
    db = client.db("grognarddb");
    const collection = db.collection(account + "_currentsession");
    collection.find({}).toArray(function (err, doc) {
        currentSession = doc[0].current_session;
        currentSessionTime = doc[0].start_time;
        console.log("Current Session: " + currentSession)
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

function dumpShow(show, channel) {
    const collection = db.collection(account + "_shows");
    collection.findOne({ _id: Number(show) }, function (err, doc) {
        if (doc == null) {
            channel.send("I can't seem to find a show with that number... Use **!shows** to get a valid list of shows.");
            return;
        }
        var tmpUpgrades="";
        if (doc.upgrades.beer) tmpUpgrades += "Beer\n";
        if (doc.upgrades.confections) tmpUpgrades += "Confections\n";
        if (doc.upgrades.binoculars) tmpUpgrades += "Disposable Binoculars\n";
        if (doc.upgrades.merchbasic) tmpUpgrades += "Basic Merchandise\n";
        if (doc.upgrades.merchquality) tmpUpgrades += "Quality Merchandise\n";
        if (doc.upgrades.merchextra) tmpUpgrades += "Extraordinary Merchandise\n";

        if (tmpUpgrades == "") tmpUpgrades = "NONE";

        var nonPerf = "";
        for (var i=0;i<4;i++)
        {
            if (doc.nonperformers[i].name != "")
            {
                nonPerf += doc.nonperformers[i].name + " (" + doc.nonperformers[i].role + ")\n";
            }
        }
        if (nonPerf == "") nonPerf = "NONE";

        Trick = []; 
        for (var i=0;i<7;i++)
        {
            var tricknum = i + 1;
            trickstr = "**TRICK "+tricknum+"**\n**PERFORMER:** "+doc.tricks[i].performer+" | **LVL:** "+doc.tricks[i].level+" | **DC:** "+doc.tricks[i].dc+"\n";
            for (var x=0;x<3;x++)
            {
                if (doc.tricks[i].actions[x].action != "" && doc.tricks[i].actions[x].action != "NONE")
                {
                    trickstr += "**ACTION:** "+doc.tricks[i].actions[x].action+" | **RESULT:** "+doc.tricks[i].actions[x].result+" | **EXC:** "+doc.tricks[i].actions[x].excitement+" | **ANT:** "+doc.tricks[i].actions[x].anticipation+"\n";
                }
            }
            Trick.push(trickstr);            
        }

        Downtime = "**ADVERTISEMENT TIER:** "+doc.adtier+" | **COST:** "+doc.adcost+"gp | **ANT:** "+doc.adant+"\n";
        for (var i=0;i<6;i++)
        {
            var day = i+1;
            if (doc.downtime[i].activity != "" && doc.downtime[i].activity != "NONE")
            {
                "**DAY "+day+":** "+doc.downtime[i].activity+" | **ANT:** "+doc.downtime[i].anticipation+"\n";
            }
        }
        
        var embed = {
            "content": "Here are the full results of the circus show you asked for...",
            "embed": {
                "color": 5629508,
                "timestamp": new Date(),
                "footer": {
                    "icon_url": bot.user.avatarURL(),
                    "text": "* After a trick action indicates 'Send in the Clowns' was used.\n© Cupcakus"
                },
                "fields": [
                    {
                        "name": "CIRCUS SHOW #" + doc._id,
                        "value": "**NAME:** " + doc.circusname + "\n**TOWN:** " + doc.circustown + "\n**DATE:** " + new Date(doc.date).toLocaleDateString(),
                        "inline": true
                    },
                    {
                        "name": "STARTING STATS",
                        "value": "**PRESTIGE:** "+doc.startprestige+"\n**EXC:** "+doc.startexcitement+"\n**ANT:** "+doc.startanticipation+"\n**MAX ANT:** "+doc.maxanticipation,
                        "inline": true
                    },
                    {
                        "name": "DOWNTIME",
                        "value": Downtime
                    },
                    {
                        "name": "TEMPORARY UPGRADES",
                        "value": tmpUpgrades,
                        "inline": true
                    },
                    {
                        "name": "NON-PERFORMERS",
                        "value": nonPerf,
                        "inline": true
                    },
                    {
                        "name": "RANDOM EVENT",
                        "value": doc.randomevent
                    },
                    {
                        "name": "ACT 1: OPENER",
                        "value": Trick[0]
                    },
                    {
                        "name": "ACT 2: BUILD-UP",
                        "value": Trick[1] + "\n" + Trick[2]
                    },
                    {
                        "name": "ACT 3: THE BIG NUMBER",
                        "value": Trick[3]
                    },
                    {
                        "name": "ACT 4: FINALE",
                        "value": Trick[4] + "\n" + Trick[5] + "\n" + Trick[6]
                    },
                    {
                        "name": "PAYOUT",
                        "value": "**FINAL EXC:** "+doc.finalexcitement+"\n**FINAL ANT:** "+doc.finalanticipation+"\n**FINAL PRESTIGE:** "+doc.finalprestige+"\n**TOTAL PAYOUT:** " + doc.payout + "gp"
                    }
                ]
            }
        }
        channel.send(embed);
    });
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

        if (message.content.startsWith("!shows")) {
            if (message.content.indexOf(" ") <= 0) {
                //Get current show
                const counter = db.collection(account + "_counter");
                counter.findOne({_id:"showID"}, function(err, doc) {
                    const collection = db.collection(account + "_shows");
                    collection.find({ "_id": { $lte: doc.seqValue } }).toArray(function (err, docs) {
                        if (docs.length == 0) {
                            message.channel.send("I can't seen to find any shows for your circus just yet... sorry!");
                        } else {
                            const embed = {
                                "content": "Here is some information about some of your previous circus shows...",
                                "embed": {
                                    "color": 12452095,
                                    "timestamp": new Date(),
                                    "footer": {
                                        "icon_url": bot.user.avatarURL(),
                                        "text": "© Cupcakus"
                                    },
                                    "fields": new Array()
                                }
                            }
                            for (var i=docs.length-1; i>docs.length-6; --i) {
                                if (i < 0) break;
                                var result = docs[i].finalexcitement - docs[i].finalanticipation;
                                var strSuccess = "FAILURE";
                                if (result > 0)
                                    strSuccess = "SUCCESS";
                                else if (result == 0)
                                    strSuccess = "CRITICAL SUCCESS";
                                    
                                var field = {
                                    name: "SHOW: #" + docs[i]._id,
                                    value: "**DATE:** " + new Date(docs[i].date).toLocaleDateString() + "\n**RESULT:** " + strSuccess + "\n**FINAL EXCITEMENT:** " + docs[i].finalexcitement + "\n**FINAL ANTICIPATION:** " +docs[i].finalanticipation + "\n**FINAL PRESTIGE:** "+ docs[i].finalprestige +"\n**PAYOUT:** "+docs[i].payout+"gp"
                                }
                                embed.embed.fields.push(field);
                            }
                            message.channel.send(embed);
                        }
                    });
                })
            }
            else
            {
                dumpShow(message.content.substr(message.content.indexOf(" ")), message.channel);
            }
        }

        if (message.content == '!circus') {
            const collection = db.collection(account + "_circus");
            collection.findOne({_id: 1}, function (err, doc) {
                var strUpgrades = "";
                if (doc.upgrades.acoustics) strUpgrades = "Acoustics, ";
                if (doc.upgrades.safetynet) strUpgrades += "Safety Net, ";
                if (doc.upgrades.paddedfloors) strUpgrades += "Padded Floors, ";
                if (doc.upgrades.upholsteredseats) strUpgrades += "Upholstered Seats, ";
                if (doc.upgrades.assignedseats) strUpgrades += "Assigned Seats, ";
                if (doc.upgrades.bleachers) strUpgrades += "Bleachers, ";
                if (doc.upgrades.spotlights) strUpgrades += "Spotlights, ";
                if (doc.upgrades.massivetent) strUpgrades += "Massive Tent, ";
                else if (doc.upgrades.hugetent) strUpgrades += "Huge Tent, ";
                else if (doc.upgrades.bigtent) strUpgrades += "Big Tent, ";
                if (doc.upgrades.watermark) strUpgrades += "Watermarked Tickets, ";
                if (strUpgrades.length > 0) strUpgrades = strUpgrades.substring(0,strUpgrades.length-2);
                else strUpgrades = "NONE";

                const embed = {
                    "content": "Here is the information about your Circus",
                    "embed": {
                        "color": 12452095,
                        "timestamp": new Date(),
                        "footer": {
                            "icon_url": bot.user.avatarURL(),
                            "text": "© Cupcakus"
                        },
                      "fields": [
                        {
                          "name": "CIRCUS",
                          "value": "**NAME**: " + doc.name + "\n**TOWN:** " + doc.town + "\n**CURRENT PRESTIGE:** " + doc.prestige + "\n**CURRENT COFFERS:** " + doc.coffers + "gp"
                        },
                        {
                          "name": "PERMANENT UPGRADES",
                          "value": strUpgrades
                        }
                      ]
                    }
                  }

                  for (var i = 0;i < doc.npcs.length; i++)
                  {
                      var field = {
                          name: "NPC PERFORMER",
                          inline: true
                      }
                      field.value = "**[" + doc.npcs[i].name + "](" + doc.npcs[i].img + ")**\n**TRAITS:** "+doc.npcs[i].traits + "\n**CHECKS:** " + doc.npcs[i].checks + "\n**DC:** " + doc.npcs[i].dc;
                      embed.embed.fields.push(field);
                  }
                  //console.log(embed.embed);
                  message.channel.send( embed );
            });
        }        
        if (message.content.startsWith('!help')) {
            if (message.content.indexOf(" ") <= 0) {
                const embed = {
                    "content": "Of course" + getName(message.author.tag) + "! What would you like help with?",
                    "embed": {
                        "color": 3809471,
                        "timestamp": new Date(),
                        "footer": {
                            "icon_url": bot.user.avatarURL(),
                            "text": "© Cupcakus"
                        },
                        "fields": [
                            {
                                "name": "!help rolls",
                                "value": "Help with your die roll statistics"
                            },
                            {
                                "name": "!help stats",
                                "value": "Help with your current character's stats"
                            },
                            {
                                "name": "!help circus",
                                "value": "Help with your party's circus"
                            }
                        ]
                    }
                };
                message.channel.send(embed);
            } else {
                var command = message.content.substring(message.content.indexOf(" ") + 1);
                if (command == "rolls") {
                    const embed_rolls = {
                        "content": "Here's how you can check your roll statistics",
                        "embed": {
                            "color": 3809471,
                            "timestamp": new Date(),
                            "footer": {
                                "icon_url": bot.user.avatarURL(),
                                "text": "© Cupcakus"
                            },
                            "fields": [
                                {
                                    "name": "!rolls",
                                    "value": "If you just type this, I will send you your current die roll statistics for the current session.  You can check this at any time, even when you are currently playing in a session! Keep in mind however that I cannot discuss achievements for the current session, even if they have already been awarded."
                                },
                                {
                                    "name": "!rolls [session #]",
                                    "value": "EXAMPLE: !rolls 123\n\nIf you type this, I will send you your die roll statistics and the achievements you earned for the session specified.  Session numbers always increase by 1, so you will have to pull out a calendar to figure out what date a session belongs to."
                                }
                            ]
                        }
                    };
                    message.channel.send(embed_rolls);
                } else if (command == "stats") {
                    const embed_rolls = {
                        "content": "I am now tracking statistics about the things you do!",
                        "embed": {
                            "color": 3809471,
                            "timestamp": new Date(),
                            "footer": {
                                "icon_url": bot.user.avatarURL(),
                                "text": "© Cupcakus"
                            },
                            "fields": [
                                {
                                    "name": "CHECKING STATS",
                                    "value": "Type **!stats** to get a list of stats I'm tracking for you and your characters..."
                                },
                                {
                                    "name": "STATS REPORT",
                                    "value": "Right now there is not a lot I can tell you in your stats report, but don't worry I'm tracking it all...  In time it will get better."
                                }
                            ]
                        }
                    };
                    message.channel.send(embed_rolls);
                } else if (command.startsWith("circus")) {
                    if (command.indexOf(" ") <= 0) {
                        const embed = {
                            "content": "OK, what can I help you with regarding your circus?",
                            "embed": {
                                "color": 3809471,
                                "timestamp": new Date(),
                                "footer": {
                                    "icon_url": bot.user.avatarURL(),
                                    "text": "© Cupcakus"
                                },
                                "fields": [
                                    {
                                        "name": "!help circus status",
                                        "value": "How to get the current status of your circus, and what it means."
                                    },
                                    {
                                        "name": "!help circus shows",
                                        "value": "How to get information about shows your circus has performed."
                                    },
                                    {
                                        "name": "!help circus rules",
                                        "value": "Basic rules for running a circus, and other tables of information you will need."
                                    }
                                ]
                            }
                        }
                        message.channel.send(embed);
                    } else {
                        var command2 = command.substring(command.indexOf(" ") + 1);
                        if (command2 == "rules") {
                            const embed = {
                                "content": "Sure!, Here are some basic rules and more help if you need it.",
                                "embed": {
                                    "color": 3809471,
                                    "timestamp": new Date(),
                                    "footer": {
                                        "icon_url": bot.user.avatarURL(),
                                        "text": "© Cupcakus"
                                    },
                                    "fields": [
                                        {
                                            "name": "BASIC CIRCUS RULES",
                                            "value": "You can put on up to one show per week. The GM will make clear at what points during the campaign you’ll have the opportunity to put on a show. A circus show is divided into four acts: the opener, the build-up, the big number, and the finale. Each act consists of one or more tricks. Each trick involves rolling a trick check. The results of these checks determine how much Excitement is generated. Your goal is to generate more Excitement than the crowd’s Anticipation, resulting in a successful show. The steps for putting on a show, in order, are as follows:\n\n1. Purchase Temporary Upgrades\n2. Choose Non-Performer Roles\n3. Roll for Random Events\n4. Tally Starting Anticipation\n5. Perform Acts and Tricks\n6. Calculate Payout"
                                        },
                                        {
                                            "name": "!help circus promotion",
                                            "value": "How to use downtime to promote your circus."
                                        },
                                        {
                                            "name": "!help circus temp",
                                            "value": "Information about temporary upgrades."
                                        },
                                        {
                                            "name": "!help circus permanent",
                                            "value": "Information about permanent upgrades."
                                        },
                                        {
                                            "name": "!help circus roles",
                                            "value": "Information about the non-performer roles."
                                        },
                                        {
                                            "name": "!help circus tricks",
                                            "value": "Information about how tricks are performed"
                                        },
                                        {
                                            "name": "!help circus payout",
                                            "value": "Information about how the payout is calculated"
                                        }
                                    ]
                                }
                            }
                            message.channel.send(embed);
                        } else if (command2 == "shows") {
                            const embed = {
                                "content": "Sure! Here's how to get information about your shows...",
                                "embed": {
                                    "color": 3809471,
                                    "timestamp": new Date(),
                                    "footer": {
                                        "icon_url": bot.user.avatarURL(),
                                        "text": "© Cupcakus"
                                    },
                                  "fields": [
                                    {
                                      "name": "GET SHOW LIST",
                                      "value": "Type **!shows** to get a list of the last 5 shows your circus has performed."
                                    },
                                    {
                                      "name": "GET SPECIFIC SHOW",
                                      "value": "If you would like a complete show sheet for a specific show, simply type **!shows [show#]** (Example **!shows 5)**"
                                    }
                                  ]
                                }
                              }
                              message.channel.send(embed);
                        } else if (command2 == "status") {
                            const embed = {
                                "content": "Absolutely! Here is how you check the status of your circus...",
                                "embed": {
                                    "color": 3809471,
                                    "timestamp": new Date(),
                                    "footer": {
                                        "icon_url": bot.user.avatarURL(),
                                        "text": "© Cupcakus"
                                    },
                                  "fields": [
                                    {
                                      "name": "CIRCUS STATUS",
                                      "value": "Simply type **!circus** to get the current state of your circus"
                                    },
                                    {
                                      "name": "SHOWS",
                                      "value": "Type **!shows** to get a list of shows you have performed"
                                    },
                                    {
                                      "name": "SPECIFIC SHOW",
                                      "value": "Type **!shows [show#]** if you want to see the full details of a specific show.  EXAMPLE: **!shows 12**"
                                    }
                                  ]
                                }
                              }
                              message.channel.send(embed);
                        } else if (command2 == "promotion") {
                            const embed = {
                                "content": "I know all about that, here's the info you need...",
                                "embed": {
                                    "color": 3809471,
                                    "timestamp": new Date(),
                                    "footer": {
                                        "icon_url": bot.user.avatarURL(),
                                        "text": "© Cupcakus"
                                    },
                                    "fields": [
                                        {
                                            "name": "PROMOTING YOUR CIRCUS",
                                            "value": "You need to generate Anticipation for every show you put on. Anticipation lasts only 1 week, meaning the you have 6 days leading up to a show to build Anticipation. During the week before you put on a show, you can purchase advertisements or Promote the Circus to increase your Anticipation. Purchasing advertisements requires no expenditure of downtime, but must be done at the beginning of the week (before Promoting the Circus) and costs money (either from the circus’s Payout funds or from the party's own wallets). Promoting the Circus costs nothing, but requires a you to undertake a downtime activity that takes 2 days.\n\n**Maximum Anticipation:** Your tent can hold only so many spectators, which limits how much Anticipation the circus can generate for each show. The circus’s starting maximum Anticipation is 20. Any Anticipation generated in excess of this is ignored. The circus’s maximum Anticipation can be increased by certain upgrades, non-performer roles, or random events."
                                        },
                                        {
                                            "name": "ADVERTISEMENTS TABLE",
                                            "value": "**TIER 1:** Cost: 1gp (Anticipation: 1)\n**TIER 2:** Cost: 5gp (Anticipation: 2)\n**TIER 3:** Cost: 20gp (Anticipation: 4)\n**TIER 4:** Cost: 40gp (Anticipation: 6)\n**TIER 5:** Cost: 80gp (Anticipation: 9)\n**TIER 6:** Cost: 150gp (Anticipation: 12)\n**TIER 7:** Cost: 250gp (Anticipation: 16)\n**TIER 8:** Cost: 500gp (Anticipation: 20)\n**TIER 9:** Cost: 800gp (Anticipation: 25)\n**TIER 10:** Cost: 1,200gp (Anticipation: 30)\n**TIER 11:** Cost: 2,000gp (Anticipation: 40)\n**TIER 12:** Cost: 3,000gp (Anticipation: 50)"
                                        },
                                        {
                                            "name": "PROMOTE THE CIRCUS (SOCIETY)",
                                            "value": "**[CIRCUS] [DOWNTIME]**\nYou spend 2 consecutive days in town generating Anticipation for your next circus show. Attempt a Society check. The DC of this check is equal to the DC appropriate for the group’s party level; see Table 10–5 on page 503 of the Pathfinder Core Rulebook. One other PC can spend 2 downtime days to Aid you, providing a +2 circumstance bonus to your Society check if they succeed at a DC 20 Society check.\n\n**Critical Success** You generate Anticipation equal to twice the sum of your level plus your Charisma modifier (minimum 2).\n**Success** You generate Anticipation equal to your level plus your Charisma modifier (minimum 1).\n**Failure** You generate 1 Anticipation.\n**Critical Failure** You generate no Anticipation."
                                        }
                                    ]
                                }
                            }
                            message.channel.send(embed);
                        } else if (command2 == "temp") {
                            const embed = {
                                "content": "Here are the temporary circus upgrades I currently know about...",
                                "embed": {
                                    "color": 3809471,
                                    "timestamp": new Date(),
                                    "footer": {
                                        "icon_url": bot.user.avatarURL(),
                                        "text": "© Cupcakus"
                                    },
                                    "fields": [
                                        {
                                            "name": "TEMPORARY UPGRADES TABLE",
                                            "value": "**Beer:** Price: 5gp (Min Pestige: 0)\n**Confections:** Price: 15gp (Min Pestige: 5)\n**Disposable Binoculars:** Price: 25gp (Min Pestige: 8)\n**Mechandise, basic:** Price: 20gp (Min Pestige: 3)\n**Merchandise, quality:** Price: 40gp (Min Pestige: 6)\n**Merchandise, extraordinary:** Price: 60gp (Min Pestige: 10)"
                                        },
                                        {
                                            "name": "UPGRADE DESCRIPTIONS",
                                            "value": "**Beer:** The circus generates an additional 2d6 Anticipation for the next show, and tricks with the audience trait gain a +2 circumstance bonus. However, the *hecklers* event is automatically triggered, in addition to any other random event rolled.\n**Confections:** The circus generates an additional 2d6 Excitement at the start of the next show.\n**Disposable Binoculars:** There is no maximum Anticipation limit for the next show.\n**Mechandise:** This temporary upgrade has no effect on the next show; instead, a fraction of the final Anticipation total of the next show is carried on to the show after that. With basic merchandise, the circus retains 25% of its final Anticipation (rounded down). This amount is instead 50% with quality merchandise, or 75% with extraordinary merchandise. This upgrade cannot be purchased for two shows in a row (that is, it cannot “stack” with itself)."
                                        }
                                    ]
                                }
                            }
                            message.channel.send(embed);
                        } else if (command2 == "permanent") {
                            const embed = {
                                "content": "Here are the permanent circus upgrades I currently know about, I hope there are more someday...",
                                "embed": {
                                    "color": 3809471,
                                    "timestamp": new Date(),
                                    "footer": {
                                        "icon_url": bot.user.avatarURL(),
                                        "text": "© Cupcakus"
                                    },
                                    "fields": [
                                        {
                                            "name": "PERMANENT UPGRADES TABLE",
                                            "value": "**Acoustics:** Price: 30gp (Min Pestige: 5)\n**Safety Net:** Price: 20gp (Min Pestige: 0)\n**Padded Floors:** Price: 100gp (Min Pestige: 6)\n**Bleachers:** Price: 50gp (Min Pestige: 5)\n**Assigned seats:** Price: 100gp (Min Pestige: 10)\n**Upholstered seats:** Price: 250gp (Min Pestige: 15)\n**Spotlights:** Price: 40gp (Min Pestige: 4)\n**Big tent:** Price: 40gp (Min Pestige: 3)\n**Huge tent:** Price: 100gp (Min Pestige: 10)\n**Massive tent:** Price: 300gp (Min Pestige: 15)\n**Watermarked tickets:** Price: 50gp (Min Pestige: 0)\n"
                                        },
                                        {
                                            "name": "UPGRADE DESCRIPTIONS",
                                            "value": "**Flooring:** Performers whose tricks have the injury trait are at a lower risk of getting hurt after a critically failed trick check. With a safety net, the DC of the flat checks to determine if a performer becomes injured or can perform at the next show decreases to 10. With padded floors, the flat check DC decreases to 5.\n**Seating:** Quality seating options generate additional Excitement for the circus’s shows but reduce the circus’s maximum Anticipation by 10. At the start of each show, a circus with bleachers generates 5 Excitement. A circus with assigned seats generates 10 Excitement instead, and upholstered seats instead generate 20 Excitement.\n**Spotlights:** This upgrade grants a permanent +1 increase to the circus’s Prestige. In addition, after purchasing this upgrade, a PC can choose the lighting role during circus shows.\n"
                                        },
                                        {
                                            "name": "UPGRADE DESCRIPTIONS CONT...",
                                            "value": "**Tent Expansions:** Bigger tents increase the circus’s maximum Anticipation limit. A big tent increases the circus’s maximum Anticipation to 50, a huge tent increases the Anticipation limit to 100, and a massive tent increases the Anticipation limit to 200.\n**Watermarked Tickets:** An intricate ticket design makes forgeries near impossible, reducing sales of counterfeit tickets. For the purpose of calculating Payout, the circus’s Prestige is treated as 2 points higher than it actually is."
                                        }

                                    ]
                                }
                            }
                            message.channel.send(embed);
                        } else if (command2 == "roles") {
                            const embed = {
                                "content": "Here is everything I know about non-performer roles",
                                "embed": {
                                    "color": 3809471,
                                    "timestamp": new Date(),
                                    "footer": {
                                        "icon_url": bot.user.avatarURL(),
                                        "text": "© Cupcakus"
                                    },
                                    "fields": [
                                        {
                                            "name": "NON-PERFORMER ROLES",
                                            "value": "You might not want to perform in every circus show your troupe puts on. In this case, you can take part in an auxiliary role that, while not the focus of the show, can still play a big part in the circus’s success. Each non-performer role requires you to abstain from performing in the show but grants a bonus to various parts of the performance. Once chosen, a non-performer role cannot be changed until the next show. Only one PC can perform a particular non-performer role per show (for example, two PCs can’t both choose the role of animal handler). Some roles can be chosen only after purchasing certain circus upgrades."
                                        },
                                        {
                                            "name": "ROLE DESCRIPTIONS",
                                            "value": "**Animal Handler:** Trick checks with the animal trait gain a +2 circumstance bonus, and a PC whose signature trick has the animal trait can perform twice in the same show (though not in the same act). If the animals break loose event is rolled on the Random Circus Events, reroll on that table instead.\n**Backup Clown:** Performers can Send in the Clowns one additional time per act.\n**Bandleader:** After each trick is completed, the bandleader can choose to generate Anticipation equal to half the bandleader’s level rounded up. The circus must have the *acoustics* permanent upgrade before you can choose the bandleader role.\n**Carnival Barker:** The carnival barker draws in more audience members as the show goes on and increases the show’s maximum Anticipation. For every successful trick check performed, the carnival barker can choose to increase the show’s maximum Anticipation by 5.\n**Clown Coordinator:** You can Send in the Clowns as a reaction instead of using 1 action."
                                        },
                                        {
                                            "name": "ROLE DESCRIPTIONS CONT...",
                                            "value": "**Costumer:** Performers get a +1 circumstance bonus to trick checks with the audience trait.\n**Lighting:** Performers gain a +1 circumstance bonus to Deception and Thievery trick checks. The circus must have the spotlights permanent upgrade before you can choose the lighting role.\n**Medic:** Performers can’t become injured from critically failing tricks with the injury trait.\n**Pyrotechnic:** Trick checks with the fire trait generate double Excitement.\n**Security Guard:** Any rolls of *hecklers* or *scalpers* on the Random Circus Events table are negated and have no effect on the performance."
                                        }

                                    ]
                                }
                            }
                            message.channel.send(embed);
                        } else if (command2 == "tricks") {
                            const embed = {
                                "content": "Here is everything you need to know about performing a trick",
                                "embed": {
                                    "color": 3809471,
                                    "timestamp": new Date(),
                                    "footer": {
                                        "icon_url": bot.user.avatarURL(),
                                        "text": "© Cupcakus"
                                    },
                                    "fields": [
                                        {
                                            "name": "CREATING A SIGNATURE TRICK",
                                            "value": "You can design your own signature trick. You decide your signature trick’s trick check (which can be a skill check, saving throw, or attack roll), choose a trick trait (below), and name and dramatically describe the trick. The signature trick’s level is equal to the your level and increases whenever the you gain a level. Only you can perform it; NPCs or other PCs cannot perform your signature trick. Otherwise, signature tricks do not have additional requirements or challenges associated with them. Your signature trick improves and grows more complex as you go up in level, as shown in Trick Progression (Below). For example, while a 1st-level performer can use only a single type of check to perform their trick and their trick has only one trick trait, a 10th-level performer can use one of two different checks for each trick attempt and their trick can have up to two trick traits."
                                        },
                                        {
                                            "name": "REDESIGNING TRICKS",
                                            "value": "Once a signature trick is created, it is difficult to change. You can change your signature trick whenever you gain a level or by spending 6 consecutive downtime days redesigning the trick."
                                        },
                                        {
                                            "name": "TRICK PROGRESSION",
                                            "value": "**LEVEL 1:** 1 trick check, 1 trick trait\n**LEVEL 4:** 2 trick checks\n**LEVEL 8:** 2 trick traits\n**LEVEL 12:** 3 trick traits\n**LEVEL 16:** 3 trick checks\n**LEVEL 20:** 4 trick traits\n"
                                        },
                                        {
                                            "name": "PERFORM A TRICK ACTION (ONE ACTION)",
                                            "value": "**[CIRCUS]**\nYou perform your signature circus trick. Attempt one of the trick checks associated with your trick. The DC for the trick check is determined by your level. The result of each trick check determines whether you generate Excitement, generate Excitement and Anticipation, or lose Excitement.\n**Critical Success** You generate Excitement equal to the trick’s level; this Excitement is added to the circus’s total Excitement for the show. You also generate Anticipation equal to half the trick’s level (rounded up); this Anticipation is added to the circus’s total Anticipation for the show.\n**Success** You generate Excitement equal to the trick’s level; this Excitement is added to the circus’s total Excitement for the show.\n**Failure** No effect.\n**Critical Failure** The circus’s Excitement value decreases by a value equal to half the trick’s level (rounded up)."
                                        },
                                        {
                                            "name": "TRICK RULES",
                                            "value": "You can Perform a Trick multiple times per act, and can choose a different possible trick check for each attempt. If you Perform a Trick twice during the same act, you take a –5 penalty to your second trick check. If you Perform a Trick three times, the penalty for the third check is –10. (This is similar to how the multiple attack penalty works) The penalties are reduced to –4 and –8, respectively, if your trick has the agile trait. This action always has the circus trait. Starting at 1st level, you can choose one additional trick trait you have access to for your signature trick, and apply it to this action as well. You can add additional traits as your level increases."
                                        },
                                        {
                                            "name": "TRICK TRAITS",
                                            "value": "Type **!help circus traits** for a list of the available trick traits and their decriptions."
                                        },
                                        {
                                            "name": "OTHER SHOW ACTIONS",
                                            "value": "In addition to *Perform a Trick* you can also do the following:\n\n**COSTAR (REACTION)**\n**Trigger:** Another performer in the same act as you is about to attempt a trick check.\n**Requirements:** The performer is willing to accept your aid.\nYou help another performer in the act pull off their trick, possibly granting them a bonus to the triggering trick check. Attempt the same check as the trick check you are attempting to aid. The DC to Costar is equal to the DC of the trick check. NPCs cannot Costar. This reaction otherwise acts as the Aid action described on page 470 of the Core Rulebook.\n\n**SEND IN THE CLOWNS (ONE ACTION)**\n**Requirements:** You or another performer has failed or critically failed a trick check during the current act.\nYou give the signal for the circus’s clown troupe to come onstage and rescue a botched trick. A failed trick becomes a success instead, or if it was a critical failure, it is instead a failure. The clowns can be sent in only once per act, and only one trick check is affected."
                                        }
                                    ]
                                }
                            }
                            message.channel.send(embed);
                        } else if (command2 == "traits") {
                            const embed = {
                                "content": "Here is everything you need to know about trick traits",
                                "embed": {
                                    "color": 3809471,
                                    "timestamp": new Date(),
                                    "footer": {
                                        "icon_url": bot.user.avatarURL(),
                                        "text": "© Cupcakus"
                                    },
                                    "fields": [
                                        {
                                            "name": "TRICK TRAITS RULES",
                                            "value": "The *Perform a Trick* action can have one or more special traits associated with it. These traits tie into other circus rules, such as random events, non-performer roles, or purchased upgrades. Some of these traits share names with other traits found in the Core Rulebook, but have different rules associated with them in the context of these circus rules. Starting at 1st level, you can add one trick trait to your signature trick. This trait must be chosen when the trick is first designed or when you change your signature trick after gaining a level, retraining, or redesigning the trick. You must have access to a trait to add it to your signature trick; to gain access to a trait, the circus must have hired an NPC performer whose trick includes that trait.\n\nYou can add additional trick traits to your signature trick by taking the *Advanced Circus Trick* general feat. See the *Extinction Curse Player’s Guide* for more details."
                                        },
                                        {
                                            "name": "ADDITIONAL NOTES",
                                            "value": "If a trick trait’s name is followed by the name of a skill in parentheses, then a performer gains a +1 circumstance bonus to Perform a Trick with that trait using that skill check. Some traits are compulsory, meaning that if a signature trick meets certain criteria then that trick must have the indicated trait. These compulsory trick traits do not count toward a signature trick’s maximum number of traits. Compulsory trick traits are marked with an asterisk (*)."
                                        },
                                        {
                                            "name": "TRICK TRAITS",
                                            "value": "**Aerial (Acrobatics):** The trick involves flight by either magical or mundane means.\n**Air (Survival):** The trick involves the manipulation of mist, wind, or another prop with atmospheric properties.\n**Alchemical:** As part of the trick, the performer can expend one alchemical item in their possession. Upon doing so, the performer gains a +1 circumstance bonus to their trick check. This destroys the item.\n**Agile:** The penalty for performing an agile trick a second or third time in the same act is –4 or –8, respectively, instead of –5 or –10.\n**Animal (Nature):** The trick utilizes trained animals.\n**Audience (Society):** The audience participates in the trick.\n**Beast (Arcana):** The trick relies on intelligent beasts.\n**Dance:** The trick involves dancing or choreographed movements. Circumstance bonuses to trick checks gained from performers using the *Costar* reaction stack."
                                        },
                                        {
                                            "name": "TRICK TRAITS CONT...",
                                            "value": "**Earth (Occultism):** The trick involves the use of mud, earth, or stone.\n**Emotion:** The trick uses alchemical or magical effects to induce a powerful emotional response from the audience. A trick must have either the alchemical or magical trait in order to have the emotion trait. Whenever a performer succeeds or critically succeeds at a trick check with the emotion trait, they can reduce the amount of Excitement or Anticipation (or both) the trick generates however they wish, down to a minimum of 0 Excitement or Anticipation.\n**Fire (Intimidation):** This trick involves fire, smoke, or pyrotechnics.\n"
                                        },
                                        {
                                            "name": "THE INJURY TRAIT",
                                            "value": "**Injury(*):** Anytime a PC uses a saving throw for one of the trick checks, the trick has this trait. If an NPC or PC performing a trick with the injury trait critically fails any trick check, they have a chance of becoming injured. To determine if the performer is injured, roll a flat DC 15 check. On a failure, the performer becomes injured. An injured performer (whether PC or NPC) cannot perform tricks for the rest of the show. In addition, at the beginning of the next show, the injured performer must succeed at a flat DC 15 check to determine if they have recovered sufficiently to perform again. On a failure, the performer cannot perform in that show, either due to the lasting effects of the injury or due to fright of becoming injured again. A performer can miss only one show after the show in which they were injured. On subsequent shows, no check is necessary and the PC or NPC can once again perform as normal."
                                        },
                                        {
                                            "name": "EVEN MORE TRAITS...",
                                            "value": "**Magical:** The trick involves the use of magic. While Performing the Trick, the performer can expend one spell slot of any level. If the performance succeeds or critically succeeds, the trick generates an additional amount of Excitement equal to the expended spell slot’s level.\n**Musical (Performance):** The trick involves musical cues or is somehow augmented by sound effects or music.\n**Plant (Nature):** The trick uses plants such as trees, flowers, or fungi, or uses magic that affects such plants.\n**Prop (Crafting):** The trick requires the use of some mundane prop or stage setup."
                                        },
                                        {
                                            "name": "THE LAST OF THE TRAITS...",
                                            "value": "**Team(*):** This trick requires more than one person. Anytime a PC performing a signature trick accepts the *Costar* reaction from a performer, the trick has this trait.\n**Time:** The trick involves distorting or altering time in some way. A performer whose trick has the time trait can perform that trick one additional time per act, taking a penalty to the fourth trick check equal to the penalty to the third trick check.\n**Water (Athletics):** The trick features water as a primary component of its performance."
                                        }
                                    ]
                                }
                            }
                            message.channel.send(embed);
                        } else if (command2 == "payout") {
                            const embed = {
                                "content": "Here is everything you need to know about how payout and prestige work",
                                "embed": {
                                    "color": 3809471,
                                    "timestamp": new Date(),
                                    "footer": {
                                        "icon_url": bot.user.avatarURL(),
                                        "text": "© Cupcakus"
                                    },
                                    "fields": [
                                        {
                                            "name": "PAYOUT AND PRESTIGE",
                                            "value": "For each show you put on, you’ll earn fame and increase the wealth in your coffers. Payout is the circus’ earnings, which you can use to upgrade your circus facilities, hire new talent, or purchase advertisements. Prestige represents the circus’s overall renown and the influence it has in towns where it performs."
                                        },
                                        {
                                            "name": "DEGREES OF SUCCESS",
                                            "value": "The circus’s show can be either a critical success, a success, or a failure. If you generate more Excitement than Anticipation, the show is a success. If you generate less Excitement than Anticipation, the show is a failure. A critically successful show is much more difficult to achieve than other critical successes in Pathfinder: in order to put on a critically successful show, you must generate exactly as much Excitement as Anticipation."
                                        },
                                        {
                                            "name": "EARNING PAYOUT",
                                            "value": "At the end of a successful performance, you earn an amount of Payout, which is calculated using the following formula.\n\n**(Prestige + Final Anticipation) = Payout (in gp)**\n\nIf the show was a critical success, the Payout is doubled.\n\nIf you fail to generate more Excitement than Anticipation, your show is a failure. Payout is calculated using Excitement instead of Anticipation, then the final amount is multiplied by one-quarter (rounded down). The formula is as follows:\n\n**(Prestige + Final Excitement) × 1/4 = Payout (in gp)**"
                                        },
                                        {
                                            "name": "EARNING PRESTIGE",
                                            "value": "The circus starts with a Prestige of 1, which you increase by performing shows. After a failed show, the circus earns 1 Prestige. If the show was a success, then the circus earns 2 Prestige instead, or 4 Prestige if the show was a critical success. Some circus upgrades (see **!help circus permanent**) require the circus to have a minimum Prestige before they can be purchased."
                                        }
                                    ]
                                }
                            }
                            message.channel.send(embed);
                        } else {
                            message.channel.send("I'm not sure how to help with that, type !help all by itself for a list of commands.");
                        }
                    }
                } else {
                    message.channel.send("I'm not sure how to help with that, type !help all by itself for a list of commands.")
                }
            }
        }

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

app.get('/circus', function (req, res) {
    const collection = db.collection(account + "_circus");
    collection.findOne({ _id: 1 }, function (err, doc) {
        res.json(doc).status(200);
    })
});

app.post('/circus', function (req, res) {
    const collection = db.collection(account + "_circus");
    collection.updateOne({ _id: 1 }, { $set: req.body }, function (err) {
        res.send('OK');
    })
});

app.get('/show/:showid', function(req, res) {
    const collection = db.collection(account + "_shows");
    collection.findOne({_id: Number(req.params.showid)}, function(err, doc) {
        if (doc == null)
        {
            res.status(404).send("Not Found");
        }
        else
        {
            res.json(doc);
        }
    });
});

app.put('/show/:showid', function(req, res) {
    const collection = db.collection(account + "_shows");
    collection.updateOne({_id: Number(req.params.showid)}, {$set:req.body}, function(err) {
        res.send("OK");
    });
});

app.post('/show', function (req, res) {
    //Get the next show number
    const collection = db.collection(account + "_counter");
    collection.findOneAndUpdate({_id:"showID"}, {$inc:{seqValue:1}}, function(err, doc) {
        req.body._id = doc.value.seqValue+1;
        const shows = db.collection(account + "_shows");
        shows.insertOne(req.body, function(err) {
            var ret = {
                show: req.body._id
            }            
            res.json(ret).status(200);
            const channels = db.collection(account + '_channels');
            channels.find({}).toArray(function (err, docs) {
                if (err) throw err;
                docs.forEach(function (doc, index) {
                    bot.channels.fetch(doc._id).then(function (channel) {
                        var str;
                        if (req.body.finalexcitement < req.body.finalanticipation)
                        {
                            str = "The audience is leaving yet another show from **" + req.body.circusname + "**. They do seem a little dissapointed... better luck next time.\n**Final Excitement:** " + req.body.finalexcitement + "\n**Final Anticipation:** " + req.body.finalanticipation + "\n**New Prestige:** " + req.body.finalprestige + "\n**Payout:** " + req.body.payout + "gp";
                        }
                        else if (req.body.finalexcitement > req.body.finalanticipation)
                        {
                            str = "Wow! What a great show from **" + req.body.circusname + "**. Everyone in the audience has a smile on their faces! Well done everybody!\n**Final Excitement:** " + req.body.finalexcitement + "\n**Final Anticipation:** " + req.body.finalanticipation + "\n**New Prestige:** " + req.body.finalprestige + "\n**Payout:** " + req.body.payout + "gp";
                        }
                        else {
                            str = "That... was... UNBELIEVEABLE!!!!! What a performance from **" + req.body.circusname + "**. A once in a lifetime performance from everyone involved! Give yourselves a pat on the back!!!!\n**Final Excitement:** " + req.body.finalexcitement + "\n**Final Anticipation:** " + req.body.finalanticipation + "\n**New Prestige:** " + req.body.finalprestige + "\n**Payout:** " + req.body.payout + "gp";
                        }
                        channel.send(str);
                    });
                });
            });        
        });
    })
});