//Bot behaviors for Pathfinder Adventure Path "Extinction Curse"

module.exports = {
    onMessage: function (message, bot, db, account) {
        if (message.content.startsWith("!shows")) {
            if (message.content.indexOf(" ") <= 0) {
                //Get current show
                const counter = db.collection(account + "_counter");
                counter.findOne({ _id: "showID" }, function (err, doc) {
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
                            for (var i = docs.length - 1; i > docs.length - 6; --i) {
                                if (i < 0) break;
                                var result = docs[i].finalexcitement - docs[i].finalanticipation;
                                var strSuccess = "FAILURE";
                                if (result > 0)
                                    strSuccess = "SUCCESS";
                                else if (result == 0)
                                    strSuccess = "CRITICAL SUCCESS";

                                var field = {
                                    name: "SHOW: #" + docs[i]._id,
                                    value: "**DATE:** " + new Date(docs[i].date).toLocaleDateString() + "\n**RESULT:** " + strSuccess + "\n**FINAL EXCITEMENT:** " + docs[i].finalexcitement + "\n**FINAL ANTICIPATION:** " + docs[i].finalanticipation + "\n**FINAL PRESTIGE:** " + docs[i].finalprestige + "\n**PAYOUT:** " + docs[i].payout + "gp"
                                }
                                embed.embed.fields.push(field);
                            }
                            message.channel.send(embed);
                        }
                    });
                })
            }
            else {
                dumpShow(message.content.substr(message.content.indexOf(" ")), message.channel, bot);
            }
        }

        if (message.content == '!circus') {
            const collection = db.collection(account + "_circus");
            collection.findOne({ _id: 1 }, function (err, doc) {
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
                if (strUpgrades.length > 0) strUpgrades = strUpgrades.substring(0, strUpgrades.length - 2);
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

                for (var i = 0; i < doc.npcs.length; i++) {
                    var field = {
                        name: "NPC PERFORMER",
                        inline: true
                    }
                    field.value = "**[" + doc.npcs[i].name + "](" + doc.npcs[i].img + ")**\n**TRAITS:** " + doc.npcs[i].traits + "\n**CHECKS:** " + doc.npcs[i].checks + "\n**DC:** " + doc.npcs[i].dc;
                    embed.embed.fields.push(field);
                }
                //console.log(embed.embed);
                message.channel.send(embed);
            });
        }
    },

    dumpShow: function (show, channel, bot) {
        const collection = db.collection(account + "_shows");
        collection.findOne({ _id: Number(show) }, function (err, doc) {
            if (doc == null) {
                channel.send("I can't seem to find a show with that number... Use **!shows** to get a valid list of shows.");
                return;
            }
            var tmpUpgrades = "";
            if (doc.upgrades.beer) tmpUpgrades += "Beer\n";
            if (doc.upgrades.confections) tmpUpgrades += "Confections\n";
            if (doc.upgrades.binoculars) tmpUpgrades += "Disposable Binoculars\n";
            if (doc.upgrades.merchbasic) tmpUpgrades += "Basic Merchandise\n";
            if (doc.upgrades.merchquality) tmpUpgrades += "Quality Merchandise\n";
            if (doc.upgrades.merchextra) tmpUpgrades += "Extraordinary Merchandise\n";

            if (tmpUpgrades == "") tmpUpgrades = "NONE";

            var nonPerf = "";
            for (var i = 0; i < 4; i++) {
                if (doc.nonperformers[i].name != "") {
                    nonPerf += doc.nonperformers[i].name + " (" + doc.nonperformers[i].role + ")\n";
                }
            }
            if (nonPerf == "") nonPerf = "NONE";

            Trick = [];
            for (var i = 0; i < 7; i++) {
                var tricknum = i + 1;
                trickstr = "**TRICK " + tricknum + "**\n**PERFORMER:** " + doc.tricks[i].performer + " | **LVL:** " + doc.tricks[i].level + " | **DC:** " + doc.tricks[i].dc + "\n";
                for (var x = 0; x < 3; x++) {
                    if (doc.tricks[i].actions[x].action != "" && doc.tricks[i].actions[x].action != "NONE") {
                        trickstr += "**ACTION:** " + doc.tricks[i].actions[x].action + " | **RESULT:** " + doc.tricks[i].actions[x].result + " | **EXC:** " + doc.tricks[i].actions[x].excitement + " | **ANT:** " + doc.tricks[i].actions[x].anticipation + "\n";
                    }
                }
                Trick.push(trickstr);
            }

            Downtime = "**ADVERTISEMENT TIER:** " + doc.adtier + " | **COST:** " + doc.adcost + "gp | **ANT:** " + doc.adant + "\n";
            for (var i = 0; i < 6; i++) {
                var day = i + 1;
                if (doc.downtime[i].activity != "" && doc.downtime[i].activity != "NONE") {
                    "**DAY " + day + ":** " + doc.downtime[i].activity + " | **ANT:** " + doc.downtime[i].anticipation + "\n";
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
                            "value": "**PRESTIGE:** " + doc.startprestige + "\n**EXC:** " + doc.startexcitement + "\n**ANT:** " + doc.startanticipation + "\n**MAX ANT:** " + doc.maxanticipation,
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
                            "value": "**FINAL EXC:** " + doc.finalexcitement + "\n**FINAL ANT:** " + doc.finalanticipation + "\n**FINAL PRESTIGE:** " + doc.finalprestige + "\n**TOTAL PAYOUT:** " + doc.payout + "gp"
                        }
                    ]
                }
            }
            channel.send(embed);
        });
    },

    registerRoutes: function (app, db, account) {
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


        app.get('/show/:showid', function (req, res) {
            const collection = db.collection(account + "_shows");
            collection.findOne({ _id: Number(req.params.showid) }, function (err, doc) {
                if (doc == null) {
                    res.status(404).send("Not Found");
                }
                else {
                    res.json(doc);
                }
            });
        });

        app.put('/show/:showid', function (req, res) {
            const collection = db.collection(account + "_shows");
            collection.updateOne({ _id: Number(req.params.showid) }, { $set: req.body }, function (err) {
                res.send("OK");
            });
        });

        app.post('/show', function (req, res) {
            //Get the next show number
            const collection = db.collection(account + "_counter");
            collection.findOneAndUpdate({ _id: "showID" }, { $inc: { seqValue: 1 } }, function (err, doc) {
                req.body._id = doc.value.seqValue + 1;
                const shows = db.collection(account + "_shows");
                shows.insertOne(req.body, function (err) {
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
                                if (req.body.finalexcitement < req.body.finalanticipation) {
                                    str = "The audience is leaving yet another show from **" + req.body.circusname + "**. They do seem a little dissapointed... better luck next time.\n**Final Excitement:** " + req.body.finalexcitement + "\n**Final Anticipation:** " + req.body.finalanticipation + "\n**New Prestige:** " + req.body.finalprestige + "\n**Payout:** " + req.body.payout + "gp";
                                }
                                else if (req.body.finalexcitement > req.body.finalanticipation) {
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
    }
};