function establishConnection() {
    connection = new WebSocket("ws://" + serverIP + serverPort);
    connection.onopen = function(evt) {
        console.log("Connection Established at " + Date.now());
    };
    connection.onmessage = function(evt) {
        if (evt.data != "") {
            var msg = JSON.parse(evt.data);
            processMessage(msg);
        }

    };
    connection.onerror = function(evt) {
        console.log("error");
    }
}

function processMessage(msg) {
    var type = msg.type;
    if (type) {
        if (type == "worldInfluenceAck") {
            console.log("Received: ");
            console.log(msg);
            var objects = msg.objects;
            for (var objID in objects) {
                var obj = objects[objID];
                delete player.worldinfluence[obj.uniqueID];
            }
        }
    } else {
        var tempworld = msg;
        tempworld[player.uniqueID] = player;
        world = tempworld;
    }
    //console.log(msg);
}



function send(msg) {
    if (connection.readyState) {
        connection.send(JSON.stringify(msg));
    }
}


function main() {
    if (localUsername != null) {
        establishConnection();
        sendOnlineData();
        mainLoop();
    }
}

function sendOnlineData() {
    send(player);
    setTimeout(sendOnlineData, 60);
}

function mainLoop() {
    if (Math.abs(next_game_tick - getCurrentTime()) > 1000) {
        next_game_tick = getCurrentTime();
    }
    if (getCurrentTime() > next_game_tick && loops < MAX_FRAMESKIP) {
        loops++;
        update();
        next_game_tick += SKIP_TICKS;
    } else {
        loops = 0;
    }
    if (!requested) {
        requestAnimationFrame(render);
        requested = true;
    }
    setTimeout(mainLoop, 0);
}

function render() {
    var interpolation = 1 - (next_game_tick - getCurrentTime()) / SKIP_TICKS;
    if (drawing) {
        draw(interpolation);
    }
    requested = false;
}


main();