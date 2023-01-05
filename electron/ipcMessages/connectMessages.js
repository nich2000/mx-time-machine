const { ipcMain } = require('electron');
const { connector } = require('../Connector');
const Serialport = require('serialport');
const { sendToAllMessage } = require('./sendMessage');
const { connections } = require('../hardware/MXBaseServer');

ipcMain.on('list-serial-ports-request', async (e) => {
    const list = (await Serialport.list()).map((item) => item.path);
    sendToAllMessage('list-serial-ports-response', list);
});

ipcMain.on('connect-serial-port-request', async (e, path) => {
    if (path) {
        connector.connect('SERIAL_PORT', path);
    }
});

ipcMain.on('disconnect-serial-ports-request', async (e) => {
    if (connector && connector.isConnect) {
        connector.disconnect();
    }
    sendToAllMessage('status-serial-port', { isOpen: false });
});

ipcMain.on('connect-wlan-request', async (e, address, portSend, portListen) => {
    connector.connect('WLAN', address, portSend, portListen);
});

ipcMain.on('disconnect-wlan-request', async (e) => {
    if (connector && connector.isConnect) {
        connector.disconnect();
    }
    sendToAllMessage('status-wlan-port', { isOpen: false });
});

ipcMain.on('status-connect-request', async (e) => {
    if (connector && connector.connector && (connector.connector.port || connector.connector.socket)) {
        sendToAllMessage(
            'status-connect',
            { isOpen: !!connector.connector.socket },
            {
                isOpen: connector.connector.port ? connector.connector.port.isOpen : false,
                path: connector.connector.port ? connector.connector.port.path : undefined
            }
        );
    } else {
        sendToAllMessage('status-connect', { isOpen: false });
    }
});

ipcMain.on('MXAction', async (e, id, action, devices) => {
    // console.log('MXAction');
    // console.log(id, action, devices)

    if(connections.length > 0) {
        let cmd = {};
        switch (action) {
            case "list" : {
                cmd = {
                  cmd: "list",
                  device: devices
                };
                break;
            }
            case "config" : {
                cmd = {
                    cmd: "config",
                    object: "device",
                    value: [],
                    device: []
                };
                break;
            }
            case "sleep" : {
                cmd = {
                    cmd: "mode",
                    object: "",
                    value: "sleep",
                    device: devices
                };
                break;
            }
            case "ready" : {
                cmd = {
                    cmd: "mode",
                    object: "",
                    value: "ready",
                    device: devices
                };
                break;
            }
            case "start" : {
                cmd = {
                    cmd: "mode",
                    object: "",
                    value: "start",
                    device: devices
                };
                break;
            }
            case "stop" : {
                cmd = {
                    cmd: "mode",
                    object: "",
                    value: "stop",
                    device: devices
                };
                break;
            }
            default : {
                console.log("unknown action")
                return;
            }
        }

        try {
            let conn = connections[0];

            let msg = JSON.stringify(cmd);
            console.log('send', msg);

            conn.write(msg);
        } catch (error) {
            console.log(error);
        }
    }
});

function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

ipcMain.on('MXResult', async (e, results) => {
    // console.log('MXResult');
    // console.log(results);

    let object = JSON.parse(results);
    // console.log(object);

    let data = 'Pilot;Device;Laps;BestSpeed;BestTime;TotalTime\n';
    for (let i = 0; i < object.length; i++) {
        // console.log(object[i]);
        // console.log(object[i][0]);
        // console.log(object[i][1]);

        let lap = object[i][1];
        data += 'pilot' + ';';
        data += 'device' + ';';
        data += lap.laps + ';';
        data += lap.best_time + ';';
        data += lap.best_speed + ';';
        data += lap.total_time + '\n';
    }

    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    let timestamp = year + "" + month + "" + date + "_" + hours + "" + minutes + "" + seconds;
    let filePath = './reports/';
    let fileName = filePath + 'MXReport_' + timestamp + '_' + randomInt(100, 999) + '.csv';

    const fs = require('fs');
    fs.mkdirSync(filePath);
    try {
        fs.writeFileSync(
            fileName,
            data,
            'utf-8'
        );
    }
    catch(e) {
        console.log(e);
    }
});
