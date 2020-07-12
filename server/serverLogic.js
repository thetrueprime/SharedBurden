var mapMaker = require('../map')

module.exports = {
    mainLoop: function(world, localLevel) {
        var currentPlayers = 0;
        var currentMonsters = 0;
        var currentFood = 0;
        for (var worldID in world) {
            var obj = world[worldID];
            var type = obj.type;
            if (type == "player") {
                currentPlayers++;
            } else if (type == "item") {
                var possx = obj.xpos + obj.xvel;
                var possy = obj.ypos + obj.yvel;
                if (mapMaker.collisionCheck(possx, possy, localLevel, true)) {
                    obj.xpos = possx;
                    obj.ypos = possy;
                } else {
                    possx = obj.xpos + obj.xvel;
                    possy = obj.ypos;
                    if (mapMaker.collisionCheck(possx, possy, localLevel, true)) {
                        obj.xpos = possx;
                        obj.ypos = possy;
                        obj.yvel = -obj.yvel;
                    } else {
                        possx = obj.xpos;
                        possy = obj.ypos + obj.yvel;
                        if (mapMaker.collisionCheck(possx, possy, localLevel, true)) {
                            obj.xpos = possx;
                            obj.ypos = possy;
                            obj.xvel = -obj.xvel;
                        } else {
                            possx = obj.xpos;
                            possy = obj.ypos;
                            obj.xvel = -obj.xvel;
                            obj.yvel = -obj.yvel;
                        }
                    }
                }
            } else if (type == "monster") {
                currentMonsters++;
                world[worldID] = moveMonster(world, obj, localLevel);
            } else if (type == "food") {
                currentFood++;
            }
        }
        if (currentPlayers > 0) {
            if (currentMonsters < 5) {
                world = spawnMonsters(world, localLevel);
            }
        }
        return world;
    },
    generateMap: function() {
        let data = {};
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 5; j++) {
                var coords = i + "," + j;
                var number = chance(0.2, 1);
                if (i == 0 && j == 0) {
                    number = 0;
                }
                console.log("random: " + number);
                switch (number) {
                    case 0:
                        data[coords] = { roomtype: "empty" }
                        break;
                    case 1:
                        data[coords] = { roomtype: "loot" }
                        break;
                    case 2:
                        data[coords] = { roomtype: "enemy" }
                        break;
                    case 3:
                        data[coords] = { roomtype: "enemy" }
                        break;
                    case 4:
                        data[coords] = { roomtype: "puzzle" }
                        break;
                    default:
                        break;
                }
                if (coords in data) {
                    data[coords].left = false;
                    data[coords].right = false;
                    data[coords].up = false;
                    data[coords].down = false;
                }
            }
        }
        var maxGridX = 5;
        var maxGridY = 5;
        for (var i = 0; i < maxGridX; i++) {
            for (var j = 0; j < maxGridY; j++) {
                var coord = i + "," + j;
                if (coord in data) {
                    var thisRoom = data[coord];
                    for (var nearX = -1; nearX <= 1; nearX++) {
                        for (var nearY = -1; nearY <= 1; nearY++) {
                            var finalx = i + nearX;
                            var finaly = j + nearY;
                            if (Math.abs(nearX) != Math.abs(nearY)) {
                                if (finalx >= 0 && finaly >= 0 && finalx < maxGridX && finaly < maxGridY) {
                                    var nextCoord = finalx + "," + finaly;
                                    if (nextCoord in data) {
                                        var thatRoom = data[nextCoord];
                                        if (nearX == -1) {
                                            thisRoom.left = true;
                                        }
                                        if (nearX == 1) {
                                            thisRoom.right = true;
                                        }
                                        if (nearY == 1) {
                                            thisRoom.down = true;
                                        }
                                        if (nearY == -1) {
                                            thisRoom.up = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return data;
    }
}

function chance(over, amount) {
    var random = Math.random();
    var option = Math.round((random / over) * amount);
    return option;
}

function distance(dx, dy) {
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

function dist(sx, sy, ex, ey) {
    return distance(ex - sx, ey - sy);
}




function getCurrentTime() {
    return Date.now();
}

function randID() {
    return "#" + Math.floor(Math.random() * 16777215) + getCurrentTime();
}

function getActiveSpawners(world, level) {
    var playerLocations = [];
    for (var worldID in world) {
        var worldObj = world[worldID];
        if (worldObj.type == "player") {
            playerLocations.push({ x: worldObj.xpos, y: worldObj.ypos });
        }
    }

    var minactivedistance = 200;
    var maxactivedistance = 1000;
    var activeSpawners = [];
    for (var levelID in level) {
        var levelObj = level[levelID];
        if (levelObj.type == "spawner") {
            for (var playerloc of playerLocations) {
                console.log("playerlocs")
                console.log(playerloc);
                var tDist = dist(playerloc.x, playerloc.y, levelObj.x, levelObj.y);
                if (tDist > minactivedistance && tDist < maxactivedistance) {
                    activeSpawners.push(levelObj);
                }
            }
        }
    }
    return activeSpawners;

}

function spawnMonsters(world, level) {
    var spawners = getActiveSpawners(world, level);

    if (spawners.length > 0) {
        var index = Math.floor(Math.random() * spawners.length);
        var thisSpawner = spawners[index];
        console.log("Attempting To spawn from: " + thisSpawner);
        var spawnType = thisSpawner.spawnType;
        var spawnHealth = 8;
        if (spawnType == "food") {
            spawnHealth = 14;
        }
        if (spawnType == "metal") {
            spawnHealth = 8;
        }
        if (spawnType == "key") {
            spawnHealth = 26;
        }
        var spawnPosX = thisSpawner.x + thisSpawner.w / 2;
        var spawnPosY = thisSpawner.y + thisSpawner.h / 2;

        var name = "monster" + randID();
        var newMonster = {
            uniqueID: name,
            type: "monster",
            monsterType: spawnType,
            target: "",
            health: spawnHealth,
            maxhealth: spawnHealth,
            xpos: spawnPosX,
            ypos: spawnPosY,
            xvel: 0,
            yvel: 0,
            inventory: {
                primary: "",
                secondary: "",
                movement: "",
                items: []
            },
            animations: {
                name: "",
                current: 0,
                max: 0,
                loop: true,
            }
        }
        world[name] = newMonster;
        console.log("Made new Monster: " + name);
        console.log(newMonster);
    }
    return world;
}


function distance(dx, dy) {
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}
var speed = 0.1;

function moveMonster(world, monster, localLevel) {
    var target = monster.target;
    if (target == "") {
        for (var worldID in world) {
            var obj = world[worldID];
            var type = obj.type;
            if (type == "player") {
                target = worldID;
                monster.target = target;
            }
        }
    }
    if (target != "") {
        var maxspeed = 1;
        var xpos = monster.xpos;
        var ypos = monster.ypos;
        var targObj = world[target];
        var tx = targObj.xpos;
        var ty = targObj.ypos;
        var dx = tx - xpos;
        var dy = ty - ypos;
        var normalisef = distance(dx, dy);
        if (normalisef == 0) {} else {
            dx = dx / normalisef;
            dy = dy / normalisef;
            pxvel = monster.xvel + dx * speed;
            pyvel = monster.yvel + dy * speed;
            if (Math.sqrt(Math.pow(pxvel, 2) + Math.pow(pyvel, 2)) < maxspeed) {
                monster.xvel = pxvel;
                monster.yvel = pyvel;
            }
        }
    }
    monster.xvel *= 0.9;
    monster.yvel *= 0.9;
    possx = monster.xpos + monster.xvel;
    possy = monster.ypos + monster.yvel;
    if (mapMaker.collisionCheck(possx, possy, localLevel)) {
        monster.xpos = possx;
        monster.ypos = possy;
    } else {
        possx = monster.xpos + monster.xvel;
        possy = monster.ypos;
        if (mapMaker.collisionCheck(possx, possy, localLevel)) {
            monster.xpos = possx;
            monster.ypos = possy;
            //monster.yvel = -obj.yvel;
        } else {
            possx = monster.xpos;
            possy = monster.ypos + monster.yvel;
            if (mapMaker.collisionCheck(possx, possy, localLevel)) {
                monster.xpos = possx;
                monster.ypos = possy;
                //obj.xvel = -obj.xvel;
            } else {
                possx = monster.xpos;
                possy = monster.ypos;
                //obj.xvel = -obj.xvel;
                //obj.yvel = -obj.yvel;
            }
        }
    }
    return monster;
}