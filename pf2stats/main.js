// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron');
var parser = require('xml2js');
var os = require('os');
const fs = require('fs');
const http = require('http');
const axios = require('axios')
const storage = require('electron-json-storage');

const dotenv = require('dotenv');
const env = dotenv.config()
if (env.error) {
    throw result.error
}

var gSettings;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 1024,
        backgroundColor: '#FFF',
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.removeMenu();
    // and load the index.html of the app.
    mainWindow.loadFile('index.html');

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    mainWindow.webContents.once('did-finish-load', () => {
        // Send Message
        http.get(gSettings.server + "/users", function (res) {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];

            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`)
            } else if (!/^application\/json/.test(contentType)) {
                error = new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType}`);
            }
            if (error) {
                console.error(error.message);
                // Consume response data to free up memory
                res.resume();
                return;                
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    mainWindow.webContents.send('UpdateUsers', parsedData);
                } catch (e) {
                    console.error(e.message);
                }
            });
        }).on('error', (e) => {
            console.error(`Got error: ${e.message}`);
        });

        // Send Message
        http.get(gSettings.server + "/circus", function (res) {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];

            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`)
            } else if (!/^application\/json/.test(contentType)) {
                error = new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType}`);
            }
            if (error) {
                console.error(error.message);
                // Consume response data to free up memory
                res.resume();
                return;                
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    mainWindow.webContents.send('UpdateCircus', parsedData);
                } catch (e) {
                    console.error(e.message);
                }
            });
        }).on('error', (e) => {
            console.error(`Got error: ${e.message}`);
        });
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
    createWindow();
    setInterval(checkLogs, 1000);

    storage.get('settings', function (error, data) {
      if (error) throw error;

      gSettings = data;
      if (gSettings.sessionDate == undefined)
      {
          gSettings.server = "http://localhost:3000";
          if (os.platform() == 'win32') {
              gSettings.DB = process.env.FGBOT_CAMPAIGN_DIR + "\\db.xml";
          } else {
              gSettings.DB = process.env.FGBOT_CAMPAIGN_DIR + "/db.xml";
          }
          gSettings.Log = process.env.FGBOT_LOG_DIR
          gSettings.session = 0;
          gSettings.sessionDate = new Date();
      }
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('sendUsers', function (event, arg) {
    axios.post(gSettings.server + '/users', arg);
});

ipcMain.on('sendCircus', function (event, arg) {
    axios.post(gSettings.server + '/circus', arg);
});

ipcMain.on('sendShow', function (event, arg) {
    axios.post(gSettings.server + '/show', arg);
});

ipcMain.on('updateShow', function (event, arg) {
    axios.put(gSettings.server + '/show/' + arg.id, arg.show);
});

ipcMain.on('getShow', function(event, arg) {
    http.get(gSettings.server + "/show/" + arg, function (res) {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`)
        } else if (!/^application\/json/.test(contentType)) {
            error = new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType}`);
        }
        if (error) {
            console.error(error.message);
            // Consume response data to free up memory
            res.resume();
            return;                
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                mainWindow.webContents.send('UpdateShow', parsedData);
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
});

function checkLogs()
{
    fs.readdir(gSettings.Log, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        //listing all files using forEach
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            if (os.platform() == 'win32') {
                var data = fs.readFileSync(gSettings.Log + "\\" + file);
            } else {
                var data = fs.readFileSync(gSettings.Log + "/" + file);
            }
            parser.parseString(data, function (err, result) {
                if (result.root.event[0]._ == "KILLED") {
                    var damagestr = result.root.damage[0]._;
                    var critical = "NO"
                    if (damagestr.includes("CRITICAL")) critical = "YES";
                    var n = damagestr.indexOf("]");
                    damagestr = damagestr.substr(n + 1, 100);
                    n = damagestr.indexOf("[");
                    damagestr = damagestr.substr(0, n - 1);
                    http.get(gSettings.server + "/mdk/" + result.root.source[0]._ + "/" + result.root.target[0]._ + "/" + result.root.damage_total[0]._ + "/" + damagestr + "/" + critical, function (err) {
                        if (os.platform() == 'win32') {
                            fs.unlinkSync(process.env.FGBOT_LOG_DIR + "\\" + file)
                        } else {
                            fs.unlinkSync(process.env.FGBOT_LOG_DIR + "/" + file)
                        }
                    });
                } 
                else if(result.root.event[0]._ == "dierollpf2")
                {
                    //Sometimes sender doesn't get populated when the GM rolls, so if no sender, just assume it's the GM
                    if (result.root.sender == undefined)
                    {
                        var fakeGM = {
                            _: 'GM'
                         };
                        result.root.sender = [ fakeGM ];
                    }
                    if (result.root.session[0]._ != gSettings.session)
                    {
                        gSettings.session = result.root.session[0]._;
                        mainWindow.webContents.send('NewSession', result.root.session[0]._);
                    }
                    http.get(gSettings.server + "/die/" + result.root.session[0]._ + "/" + result.root.sender[0]._ + "/" + result.root.user[0]._ + "/" + result.root.dice[0]._, function (err) {
                        if (os.platform() == 'win32') {
                            fs.unlinkSync(gSettings.Log + "\\" + file);
                        } else {
                            fs.unlinkSync(gSettings.Log + "/" + file);
                        }
                    });
                }
            });
        });
    });
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
