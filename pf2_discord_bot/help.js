/* help.js -- Various help commands for the bot's functions
 *
 * Copyright (c) 2020 Cupcakus
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

module.exports = {
    onHelp: function(message, bot) {
        if (message.content.startsWith('!help')) {
            if (message.content.indexOf(" ") <= 0) {
                const embed = {
                    "content": "Of course. What would you like help with?",
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
    }
}