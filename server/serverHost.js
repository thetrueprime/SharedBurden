var http = require('http');
var url = require('url');
var fs = require('fs');
var imports = require('./serverLogic')

var WebSocketServer = require('websocket').server;

var connections = []

let playerConnections = [];

var port = "32457";

var server = http.createServer(
    function(request, response) {
        console.log((new Date()) + " Received request for " + request.url);
        response.writeHead(404);
        response.end();
    }
);

server.listen(port, function() {
    console.log((new Date()) + " Server is listening on port " + port);
});

var dateTimes = {};

var worldInfluencePlayerObjects = {};


function hostServer() {

    var wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: true // You should use false here!
    });

    wsServer.on('connect', function(connection) {
        console.log((new Date()) + " Connection accepted!");
        connections.push(connection);
        var connectionid = connections.length - 1;

        // Handle the "message" event received over WebSocket. This
        // is a message sent by a client, and may be text to share with
        // other users or a command to the server.

        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                msg = JSON.parse(message.utf8Data);
                if (msg.type == "player") {

                    if ("worldinfluence" in msg) {
                        var worldObjects = msg.worldinfluence;
                        var objectsReceived = {};
                        if (msg.uniqueID in worldInfluencePlayerObjects) {
                            objectsReceived = worldInfluencePlayerObjects[msg.uniqueID];
                        }
                        for (var objID in worldObjects) {
                            console.log("Here ");
                            console.log(msg);
                            var object = worldObjects[objID];
                            if ("status" in object) {
                                if (object.status == "removed") {
                                    delete world[object.uniqueID];
                                    console.log("Deleting");
                                }
                                if (object.status == "alive") {
                                    world[object.uniqueID] = object;
                                    console.log("Setting");
                                }
                            }

                            console.log("Recieved World Influence Object: " +
                                object.uniqueID);
                            objectsReceived[object.uniqueID] = object;
                        }
                        worldInfluencePlayerObjects[msg.uniqueID] = objectsReceived;
                        delete msg.worldinfluence;
                    }
                    connectionsPlayers[connectionid] = msg.uniqueID;

                    world[msg.uniqueID] = msg;
                }
            }
        });

        // Handle the WebSocket "close" event; this means a user has logged off
        // or has been disconnected.

        connection.on('close', function(connection) {
            console.log("Player Disconnected")

        });
    });
}

var world = { map: { type: "map", xpos: 0, ypos: 0, mapcontent: imports.generateMap() } };

var connectionsPlayers = {};

function sendOutUpdates() {
    var i = 0;
    for (var connection of connections) {
        var playerId = connectionsPlayers[i];
        if (playerId) {
            var worldObjects = worldInfluencePlayerObjects[playerId];
            if (countProps(worldObjects)) {
                var toSend = { type: "worldInfluenceAck", objects: worldObjects };
                console.log("Sending to " + playerId);
                console.log(toSend);
                connection.send(JSON.stringify(toSend));
                delete worldInfluencePlayerObjects[playerId];
            }
        }
        connection.send(JSON.stringify(world));
        i++
    }
    setTimeout(sendOutUpdates, 100);
}

function countProps(obj) {
    var l = 0;
    for (p in obj) l++;
    return l;
}

function gameLoop() {
    //Game running
    world = imports.mainLoop(world);
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