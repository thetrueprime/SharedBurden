var http = require('http');
var url = require('url');
var fs = require('fs');
var imports = require('./serverLogic')

var WebSocketServer = require('websocket').server;

var connections = []

let playerConnections = [];

var port = "32457";

var server = http.createServer(
    function (request, response) {
        console.log((new Date()) + " Received request for " + request.url);
        response.writeHead(404);
        response.end();
    }
);

server.listen(port, function () {
    console.log((new Date()) + " Server is listening on port " + port);
});

var dateTimes = {};
function hostServer() {

    var wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: true // You should use false here!
    });

    wsServer.on('connect', function (connection) {
        console.log((new Date()) + " Connection accepted!");
        connections.push(connection);


        // Handle the "message" event received over WebSocket. This
        // is a message sent by a client, and may be text to share with
        // other users or a command to the server.

        connection.on('message', function (message) {
            if (message.type === 'utf8') {
                msg = JSON.parse(message.utf8Data);
                if (msg.type == "player") {
                    
                }
            }
        });

        // Handle the WebSocket "close" event; this means a user has logged off
        // or has been disconnected.

        connection.on('close', function (connection) {
            console.log("Player Disconnected")
         
        });
    });
}

var world = {};
function sendOutUpdates() {
    for (var connection of connections) {
        connection.send(JSON.stringify(world));
    }
    setTimeout(sendOutUpdates, 100);
}


function gameLoop(){
    //Game running

}


var next_game_tick = Date.now();
var TICKS_PER_SECOND = 20;
var SKIP_TICKS = 1000 / TICKS_PER_SECOND;
var MAX_FRAMESKIP = 5;
var loops = 0;
function gameStateRunner() {
    if (Date.now() > next_game_tick && loops < MAX_FRAMESKIP) {
        loops++;
        gameLoop();
        next_game_tick += SKIP_TICKS;
    } else {
        loops = 0;
    }
    setTimeout(gameStateRunner, 0);
}

gameStateRunner();
hostServer();
sendOutUpdates();
