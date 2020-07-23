# Fantasy Grounds/Discord Bot
Here is a direct copy of the [Pathfinder 2E Discord Bot](https://www.fantasygrounds.com/forums/showthread.php?55918) and Fantasy Ground extensions I use to enable stats tracking for my players.  This is a very very hacky solution just meant for my personal use and not yet ready for public use.  However, there has been some interest in someone else taking my code and creating a more universal solution, or a solution that works with D&D 5E.

This is heavily modified for **my** group.  As we are currently doing the *Extinction Curse* campaign there is a lot of circus code in there you will likely not need.  Feel free to remove it.

# Setup
I use a Windows machine, with [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10) (Ubuntu 18.04)
You will need to install [Node.JS](https://nodejs.org/en/), NPM, and [MongoDB](https://docs.mongodb.com/manual/installation/) for WSL

## Overview
There are three code-bases for this tool.
- **pf2_discord_bot:** This is the Discord Bot (Grognard), powered by Node.JS
- **pf2statsext:** This is the FG/FGU Extension that collects the die roll and kill stats and exports them to log files on disk.
- **pf2stats:** This is the windows application, powered by [Electron](https://www.electronjs.org/) that parses the logs files and sends them off to the bot.

## Local environment setup

- Inside each directory that has a file called `example-dot-env.txt`
  - Copy `example-dot-env.txt` to `.env`
  - Edit the values in that file as needed
  - This file is included in the `.gitignore` file and will not be commited into the git repo

## Database Setup
- Make sure mongo is running `sudo service mongodb start`
- Run the mongo command line `mongo`
- Create the database `use grognarddb`
- Create the *users* collection `db.test_account_users.insert({_id:1})`
- Create the *counter* collection `db.test_account_counter.insert({_id:"showID", seqValue:0})`
- Create the *currentsession* collection `db.test_account_currentsession.insert({_id:1, current_session:"1", start_time: ISODate("2020-07-20T00:21:53.607Z")})`
- Exit the mongo command line `exit`

## PF2 Discord Bot
- You will need to create and register your bot with [Discord](https://discord.com/developers).
- Open **pf2_discord_bot/main.js** and find `bot.login([SECRET_KEY]);` replace *SECRET_KEY* with the token for your bot.  Add the bot to your server, and make sure you give it permissions to join and read/write to all your text channels.
- Install prequisites `npm install`
- Run the bot `npm start` you should see the bot login to your Discord.  You are now good to go.

## Windows Application
- By default the application will look for logs written to "*C:\Projects\Logs*".  If you want to read and write logs to a different directory you will need to edit this in both this application and the extension.  It's probably easiest to just create the directory.  In WSL this will be `mkdir /mnt/c/projects/logs`
- Install prerequisites `npm install`
- Run the application `npm start` **NOTE:** Make sure you run this from a Windows command prompt... NOT WSL
- Add users you want to be able to talk to your bot in the *Campaign* tab of the application
  - Gamemaster is the Discord ID of the game master for your game.  This user has full power to tell the bot to do things.  EXAMPLE: cupcakus#8691
  - Character is the character name the player is playing as EXAMPLE: Roggard
  - Owner is the Fantasy Grounds username that user is using.  Watch the FG chat window for when they connect.  You can also open the characters panel in FG and see who owns what character.  EXAMPLE: cupcakus
  - Discord is the Discord ID of the player that owns that character/FG user.  EXAMPLE: cupcakus#8691
  - The app only supports 4 players at this time.  But it should be trivial enough to make it more if you want.
- **NOTE:** There is a settings tab in the APP... this does nothing at the moment, even if it looks like it should.
  
## FG/FGU Extension
- Edit **pf2statsext/build.sh** and input the path to your Fantasy Grounds installation.
- Run the script... `./build.sh` this should install the extension in your FG/FGU
- With both the BOT and the APP running, open Fantasy Grounds and load a PF2E campaign with the extension enabled.
- Roll a die in the chat window, you should see both the BOT and APP report a new session has started.  This means everything is working!

## How To Use
Each time you load a campaign in Fantasy Grounds and roll a die a new session will be created.  It's important to not close and open FG during a session because of this.  All the stats for the current session will reset each time you do.
- In Discord, verify the bot is working by typing `!version` the bot should respond.  If it doesn't want to talk to you but still responds, it doesn't think you are authorized.  Make sure you set up your Disord ID correctly as the Gamemaster in the APP
- If you want a channel to recieve toasts each time one of your player's kills something you need to tell Grognard to talk there.  Type `!register` to register a channel with him.
  - You can type `!unregister` to remove a specific channel or `!clear` to clear all channels
- At the end of a session type `!rolls` to show all your player's their roll stats for the session and their achievements they earned.
- Players can talk to the bot too, but they must do so via DM so it doesn't spam up the text channel for your campaign.
- Players can ask the bot `!stats` via DM to get their basic stats... (Enemies killed, attendance %, ...)

## Known Issues
- Sometimes FG/FGU will write a log file and the APP will try to parse it before it's done.  This will pop up an error on the APP about a resource being locked, clicking OK on the error will bypass the issue.
- I need to santize the inputs sent over the network still... If a player has an illegal character in his or her name, or weapon, it will gum up the works and the stats won't register correctly.
