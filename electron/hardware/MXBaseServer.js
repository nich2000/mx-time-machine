let net = require('net');

const { sendToAllMessage } = require('../ipcMessages/sendMessage');

let connections = [];

let server = net.createServer();
server.on('connection', handleConnection);

server.listen(30000, function() {
    console.log('server listening to: %j', server.address());
});

function handleConnection(conn) {
    // console.log(conn)
    connections.push(conn)

    let remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
    console.log('new connection from: %s', remoteAddress);

    let mxBase = {
        id: 101,
        ip: conn.remoteAddress,
        connected: true,
        status: 'base connected'
    }
    sendToAllMessage('mx-base', mxBase);

    conn.on('data', onConnData);
    conn.once('close', onConnClose);
    conn.on('error', onConnError);

    // {"cmd":"ping","base":101,"device":1,"status":255,"battery":0,"time":0,"lat":0,"lon":0,"rssi":47}
    // {"cmd":"lap","base":101,"device":1,"time":"2022.01.01 20:00:00.000","sectors":321,"status":123}
    function onConnData(d) {
        let data = new Buffer.from(d).toString()
        if (data === '0') {
            return;
        }
        // console.log('onConnData: ', data);

        let dataList = data.replaceAll('}{', '}**|**|**{').split('**|**|**')
        // console.log('onConnData, packet count: ', dataList.length);

        for (let i = 0; i < dataList.length; i++) {
            try {
                // console.log('onConnData, packet: ', dataList[i]);
                let object = JSON.parse(dataList[i]);
                console.log(object);

                switch (object.cmd) {
                    case "ping": {
                        sendToAllMessage('mx-ping', object);
                        break;
                    }
                    case "lap": {
                        sendToAllMessage('mx-lap', object);
                        break;
                    }
                }
            } catch (error) {
                console.error(error);
                console.log(dataList[i]);
            }
        }
    }

    function onConnClose() {
        console.log('connection from: %s, closed', remoteAddress);

        let mxBase = {
            id: 101,
            ip: conn.ip,
            connected: false,
            status: 'base disconnected'
        }
        sendToAllMessage('mx-base', mxBase);

        connections.pop();
    }

    function onConnError(err) {
        console.log('connection from: %s, error: %s', remoteAddress, err.message);

        let mxBase = {
            id: 101,
            ip: conn.ip,
            connected: false,
            status: 'base disconnected'
        }
        sendToAllMessage('mx-base', mxBase);

        connections.pop();
    }
}

// TODO Пока костыляю (см. выше). Но нужно будет делать по правильному.
class MXBaseServer {
    port = 30000;
    server;

    connect = (port) => {

    }

    disconnect = () => {

    }

    send = (message) => {

    }

    isOpen = () => {

    }
}

module.exports = { connections };
