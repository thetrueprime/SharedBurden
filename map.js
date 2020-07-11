let levelGenned = false;
module.exports = {
    buildLocalLevel: function(MapData) {
        return generateLevel(MapData);
    },
    collisionCheck: function(possx, possy, locallevel) {
        return collisionCheck(possx, possy, locallevel);
    }
};


var maxX = 5;
var maxY = 5;
var roomWidth = 512;
var roomHeight = 512;

function generateLevel(MapData) {
    var map = {};
    console.log("MapDATA");
    console.log(MapData);
    for (var x = 0; x < maxX; x++) {
        for (var y = 0; y < maxY; y++) {
            coords = x + "," + y;
            console.log(coords);
            if (coords in MapData) {
                var room = MapData[coords];
                var generatedTerrain = generateRoom(room.roomtype, x * roomWidth, y * roomHeight, roomWidth, roomHeight, room);
                for (var tName in generatedTerrain) {
                    var thisTerrain = generatedTerrain[tName];
                    map[coords + "room" + tName] = thisTerrain;
                }
            }
        }
    }
    console.log("Generated");
    console.log(map);
    levelGenned = true;
    return map;
}

function generateRoom(type, startx, starty, width, height, roomData) {
    var doorthick = 32;
    var wallthick = 16;


    var room = {};

    room["basefloor"] = {
        x: startx,
        y: starty,
        w: width,
        h: height,
        type: "cobblefloor"
    }

    room["topWall"] = {
        x: startx,
        y: starty,
        w: width,
        h: wallthick,
        type: "solid"
    }
    room["rightWall"] = {
        x: startx + width - wallthick,
        y: starty,
        w: wallthick,
        h: height,
        type: "solid"
    }
    room["bottomWall"] = {
        x: startx,
        y: starty + height - wallthick,
        w: width,
        h: wallthick,
        type: "solid"
    }
    room["leftWall"] = {
            x: startx,
            y: starty,
            w: wallthick,
            h: height,
            type: "solid"
        }
        //EMPTY room (extra grapple points?)
    if (type == "empty") {
        room["topLeft"] = {
            x: startx,
            y: starty,
            w: width / 5,
            h: height / 5,
            type: "field"
        }

        room["topRight"] = {
            x: startx + width - width / 5,
            y: starty,
            w: width / 5,
            h: height / 5,
            type: "field"
        }
        room["bottomLeft"] = {
            x: startx,
            y: starty + height - height / 5,
            w: width / 5,
            h: height / 5,
            type: "field"
        }
        room["bottomRight"] = {
            x: startx + width - width / 5,
            y: starty + height - height / 5,
            w: width / 5,
            h: height / 5,
            type: "field"
        }
        room["mid"] = {
            x: startx + width / 2,
            y: starty + height / 2,
            w: width / 5,
            h: height / 5,
            type: "grappleBlock"
        }
    }
    if (roomData.left) {
        //make whole for door
        room["leftWall"] = {
            x: startx,
            y: starty,
            w: wallthick,
            h: -height / 10 + height / 2,
            type: "solid"
        }
        room["leftDoor"] = {
            x: startx,
            y: starty - height / 10 + height / 2,
            w: doorthick,
            h: height / 5,
            locked: true,
            type: "door"
        }
        room["leftWallLower"] = {
            x: startx,
            y: starty + height / 10 + height / 2,
            w: wallthick,
            h: -height / 10 + height / 2,
            type: "solid"
        }
    }
    if (roomData.right) {

        room["rightWall"] = {
            x: startx + width - wallthick,
            y: starty,
            w: wallthick,
            h: -height / 10 + height / 2,
            type: "solid"
        }
        room["rightDoor"] = {
            x: startx + width - doorthick,
            y: starty - height / 10 + height / 2,
            w: doorthick,
            h: height / 5,
            locked: true,
            type: "door"
        }
        room["rightWallLower"] = {
            x: startx + width - wallthick,
            y: starty + height / 10 + height / 2,
            w: wallthick,
            h: -height / 10 + height / 2,
            type: "solid"
        }
    }
    if (roomData.up) {
        room["topWall"] = {
            x: startx,
            y: starty,
            w: -width / 10 + width / 2,
            h: wallthick,
            type: "solid"
        }
        room["upDoor"] = {
            x: startx - width / 10 + width / 2,
            y: starty,
            w: width / 5,
            h: doorthick,
            locked: true,
            type: "door"
        }
        room["topWallRighter"] = {
            x: startx + width / 10 + width / 2,
            y: starty,
            w: -width / 10 + width / 2,
            h: wallthick,
            type: "solid"
        }
    }
    if (roomData.down) {
        room["bottomWall"] = {
            x: startx,
            y: starty + height - wallthick,
            w: -width / 10 + width / 2,
            h: wallthick,
            type: "solid"
        }
        room["downDoor"] = {
            x: startx - width / 10 + width / 2,
            y: starty + height - doorthick,
            w: width / 5,
            h: doorthick,
            locked: true,
            type: "door"
        }
        room["bottomWallRighter"] = {
            x: startx + width / 10 + width / 2,
            y: starty + height - wallthick,
            w: -width / 10 + width / 2,
            h: wallthick,
            type: "solid"
        }
    }
    room["topgrapple"] = {
        x: startx,
        y: starty,
        w: wallthick * 2,
        h: wallthick * 2,
        type: "grappleBlock"
    }
    room["rightgrapple"] = {
        x: startx + width - wallthick * 2,
        y: starty,
        w: wallthick * 2,
        h: wallthick * 2,
        type: "grappleBlock"
    }
    room["bottomgrapple"] = {
        x: startx + width - wallthick * 2,
        y: starty + height - wallthick * 2,
        w: wallthick * 2,
        h: wallthick * 2,
        type: "grappleBlock"
    }
    room["leftgrapple"] = {
        x: startx,
        y: starty + height - wallthick * 2,
        w: wallthick * 2,
        h: wallthick * 2,
        type: "grappleBlock"
    }
    return room;

}


function getFloorTypeAt(x, y, level) {
    var allType = [];
    for (floorID in level) {
        var flooring = level[floorID];
        var type = flooring.type;
        if (flooring.x <= x && flooring.x + flooring.w >= x && flooring.y <= y && flooring.y + flooring.h >= y) {
            allType.push(type);
        }
    }
    for (var i = 0; i < allType.length; i++) {
        if (allType[i] == "door") {
            return allType[i];
        }
    }
    for (var i = 0; i < allType.length; i++) {
        if (allType[i] == "solid") {
            return allType[i];
        }
    }
    for (var i = 0; i < allType.length; i++) {
        if (allType[i] == "grappleBlock") {
            return allType[i];
        }
    }
    if (allType.length > 0) {
        return allType[0];
    }
}

function getFloorAt(x, y, level) {
    var allFloor = [];
    for (floorID in level) {
        var flooring = level[floorID];
        if (flooring.x <= x && flooring.x + flooring.w >= x && flooring.y <= y && flooring.y + flooring.h >= y) {
            allFloor.push(flooring);
        }
    }
    for (var i = 0; i < allFloor.length; i++) {
        if (allFloor[i].type == "door") {
            return allFloor[i];
        }
    }
    for (var i = 0; i < allFloor.length; i++) {
        if (allFloor[i].type == "solid") {
            return allFloor[i];
        }
    }
    if (allFloor.length > 0) {
        return allFloor[0];
    }
}


function collisionCheck(possx, possy, level) {
    //TODO
    if (possx && possy) {
        var terrain = getFloorAt(possx, possy, level);
        if (terrain !== undefined) {
            var type = terrain.type;
            if (type == "solid") {
                return false;
            }
            if (type == "door") {
                if (terrain.locked) {
                    return false;
                }
            }
        }
    }
    return true;
}