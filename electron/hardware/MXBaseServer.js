let net = require('net');

const { sendToAllMessage } = require('../ipcMessages/sendMessage');

let connections = [];

let server = net.createServer();
server.on('connection', handleConnection);

server.listen(30000, function() {
    console.log('server listening to %j', server.address());
});

function handleConnection(conn) {
    console.log(conn)
    connections.push(conn)

    let remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
    console.log('new client connection from %s', remoteAddress);

    conn.on('data', onConnData);
    conn.once('close', onConnClose);
    conn.on('error', onConnError);

    // {"cmd":"ping","base":101,"device":1,"status":255,"battery":0,"time":0,"lat":0,"lon":0,"rssi":47}
    function onConnData(d) {
        let data = new Buffer.from(d).toString()
        // console.log(data)
        let object = JSON.parse(data)
        // console.log(object)
        sendToAllMessage('status-mx', object)
        // conn.send(data)
    }

    function onConnClose() {
        console.log('connection from %s closed', remoteAddress);

        connections.pop()
    }

    function onConnError(err) {
        console.log('Connection %s error: %s', remoteAddress, err.message);
    }
}

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