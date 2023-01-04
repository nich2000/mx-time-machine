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
                    device: devices
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
            case "race" : {
                cmd = {
                    cmd: "mode",
                    object: "",
                    value: "race",
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
