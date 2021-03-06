var futureNPositions = {};





var isGrappling = false;

function update() {
    //network interp (lazy over 10 smoothing)
    for (let worldID in world) {
        if (worldID != player.uniqueID) {
            let object = world[worldID];
            let fx = object.xpos;
            let fy = object.ypos;
            let xpos = object.xpos;
            let ypos = object.ypos;
            if (worldID in futureNPositions) {
                var fPos = futureNPositions[worldID];
                fx = fPos.xpos;
                fy = fPos.ypos;
            }
            var interp = 1 / 10;
            var useX = (fx - xpos) * interp + xpos;
            var useY = (fy - ypos) * interp + ypos;
            object.xpos = useX;
            object.ypos = useY;
        }
    }
    //game running

    ///MOVEMENT
    let inventory = player.inventory;
    var maxspeed = 10;
    //CHEF
    if (character == "chef") {
        if (inventory.movement != "") {
            var mousePos = getMousePos();
            var startx = player.xpos;
            var starty = player.ypos;
            var diffx = mousePos.x - startx;
            var diffy = mousePos.y - starty;
            var ndiffx = diffx / distance(diffx, diffy);
            var ndiffy = diffy / distance(diffx, diffy);
            var length = 1000;
            var targetx = startx + ndiffx * length;
            var targety = starty + ndiffy * length;
            var ray = rayTrace(startx, starty, targetx, targety, level);
            var gx = mousePos.x;
            var gy = mousePos.y;
            if (ray) {
                gx = ray.x;
                gy = ray.y;
            }
            var grapplePos = { x: gx, y: gy };
            if (isGrappling && (isPressing(KEY_CODES.lmb) || isPressing(KEY_CODES.rmb))) {
                grapplePos = player.grappling;
            }
            isGrappling = false;
            var flooratGrapple = getFloorTypeAt(grapplePos.x, grapplePos.y, level);
            if (flooratGrapple == "grappleBlock") {
                if (isPressing(KEY_CODES.lmb)) {
                    isGrappling = true;
                    var xpos = player.xpos;
                    var ypos = player.ypos;
                    var xvel = player.xvel;
                    var yvel = player.yvel;
                    var dx = grapplePos.x - xpos;
                    var dy = grapplePos.y - ypos;
                    var idx = xpos - grapplePos.x;
                    var idy = ypos - grapplePos.y;
                    var ropeLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

                    var newX = xpos + xvel;
                    var newY = ypos + yvel;
                    var ndx = newX - grapplePos.x;
                    var ndy = newY - grapplePos.y;

                    var newRopeLength = Math.sqrt(Math.pow(ndx, 2) + Math.pow(ndy, 2));
                    if (newRopeLength < ropeLength) {
                        //slack, nothing to do
                    } else {
                        var speedOfPlayer = Math.sqrt(Math.pow(xvel, 2) + Math.pow(yvel, 2));

                        var angleOfPlayer = Math.atan2(yvel, xvel);



                        var angleofGrappleRope = Math.atan2(dy, dx);
                        if (angleofGrappleRope < 0) {
                            angleofGrappleRope = Math.atan2(idy, idx);
                        }

                        var angleofTravel = angleofGrappleRope + Math.PI / 2; //anti clockwise
                        if (angleofTravel > Math.PI * 2) {
                            angleofTravel = angleofTravel - Math.PI;
                        }


                        var difference = angleOfPlayer - angleofTravel;
                        if (difference > Math.PI / 2) {
                            difference = Math.PI - difference;
                        }

                        var speedinDirection = Math.cos(difference) * speedOfPlayer;

                        player.xvel = speedinDirection * Math.cos(angleofTravel);
                        player.yvel = speedinDirection * Math.sin(angleofTravel);
                    }
                }

                if (isPressing(KEY_CODES.rmb)) {
                    isGrappling = true;
                    console.log(grapplePos);
                    var xpos = player.xpos;
                    var ypos = player.ypos;
                    var xvel = player.xvel;
                    var yvel = player.yvel;
                    var dx = grapplePos.x - xpos;
                    var dy = grapplePos.y - ypos;
                    var ropeLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                    var ndx = dx / ropeLength;
                    var ndy = dy / ropeLength;
                    var boostamount = 1;

                    var centralBoostx = boostamount * ndx;
                    var centralBoosty = boostamount * ndy;

                    if (distance(player.xvel + centralBoostx, player.yvel + centralBoosty) < maxspeed) {
                        player.xvel += centralBoostx;
                        player.yvel += centralBoosty;
                    }
                }
            }
        } else {
            isGrappling = false;
        }
        if (isGrappling) {
            player.grappling = grapplePos;
        } else {
            delete player.grappling;
        }
        //TODO SOME SORT OF COOLDOWN
        if (inventory.primary != "") {
            if (isPressing(KEY_CODES.primary)) {
                var items = player.inventory.items;
                if (items.length <= 0) {
                    displayMessage("You don't have any food to cook!")
                } else {
                    var toremove = -1;
                    for (let itemid in items) {
                        var item = items[itemid];
                        if (item.type == "food") {
                            if (!item.cooked && item.chopped) {
                                if (player.cooldowns[0] <= 0) {
                                    player.cooldowns[0] = player.maxcooldowns[0];
                                    displayMessage("Cooking Food!");
                                    item.cooked = true;
                                    chuckFood(item.name);
                                    toremove = itemid;
                                    playAnim("cooking");
                                    damageField(player.xpos, player.ypos, { x: 0, y: 1 }, 100, Math.PI * 2, 20, "FIRE");
                                    break;
                                }
                            }
                        }
                    }
                    if (toremove > -1) {
                        items.splice(toremove, 1);
                    }
                }
            }
        }
        if (inventory.secondary != "") {
            if (isPressing(KEY_CODES.secondary)) {
                var items = player.inventory.items;
                if (items.length <= 0) {
                    displayMessage("You don't have any food to chop!")
                } else {
                    for (let item of items) {
                        if (item.type == "food") {
                            if (!item.cooked && !item.chopped) {
                                if (player.cooldowns[1] <= 0) {
                                    player.cooldowns[1] = player.maxcooldowns[1];
                                    displayMessage("Chopping Food!");
                                    item.chopped = true;
                                    playAnim("chopping");
                                    damageField(player.xpos, player.ypos, { x: 0, y: 1 }, 100, Math.PI * 2, 20, "KNOCKBACK");
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    //Engineer
    if (character == "engineer") {
        if (inventory.movement != "") {
            var accel = 2;
            if (isPressing(KEY_CODES.up)) {
                if (distance(player.xvel, player.yvel - accel) < maxspeed) {
                    player.yvel -= accel;
                }
            }
            if (isPressing(KEY_CODES.down)) {
                if (distance(player.xvel, player.yvel + accel) < maxspeed) {
                    player.yvel += accel;
                }
            }
            if (isPressing(KEY_CODES.right)) {
                if (distance(player.xvel + accel, player.yvel) < maxspeed) {
                    player.xvel += accel;
                }
            }
            if (isPressing(KEY_CODES.left)) {
                if (distance(player.xvel - accel, player.yvel) < maxspeed) {
                    player.xvel -= accel;
                }
            }
        }
    }
    if (character == "fighter") {
        if (inventory.movement != "") {
            var ismoving = false;
            var accel = 1;
            if (isPressing(KEY_CODES.up)) {
                if (distance(player.xvel, player.yvel - accel) < maxspeed) {
                    player.yvel -= accel;
                }
                ismoving = true;
            }
            if (isPressing(KEY_CODES.down)) {
                if (distance(player.xvel, player.yvel + accel) < maxspeed) {
                    player.yvel += accel;
                }
                ismoving = true;
            }
            if (isPressing(KEY_CODES.right)) {
                if (distance(player.xvel + accel, player.yvel) < maxspeed) {
                    player.xvel += accel;
                }
                ismoving = true;
            }
            if (isPressing(KEY_CODES.left)) {
                if (distance(player.xvel - accel, player.yvel) < maxspeed) {
                    player.xvel -= accel;
                }
                ismoving = true;
            }
            if (!ismoving) {
                player.xvel *= 0.75;
                player.yvel *= 0.75;
            }
        }
        if (isPressing(KEY_CODES.primary)) {
            if (player.cooldowns[2] <= 0) {
                player.cooldowns[2] = player.maxcooldowns[2];
                let toremove = -1;
                var items = player.inventory.items;
                for (let itemID = 0; itemID < items.length; itemID++) {
                    let item = items[itemID];
                    if (item.type == "key") {
                        console.log("Using Key");
                        displayMessage("Using Key");
                        if (useKey()) {
                            toremove = itemID;
                            //playAnim("key");
                            break;
                        }
                    }
                }
                if (toremove > -1) {
                    items.splice(toremove, 1);
                } else {
                    displayMessage("You are too far from anything you can use your key on");
                }
            }
        }
    }
    var possx = player.xpos + player.xvel;
    var possy = player.ypos + player.yvel;

    if (collisionCheck(possx, possy, level)) {
        player.xpos = possx;
        player.ypos = possy;
    } else {
        possx = player.xpos + player.xvel;
        possy = player.ypos;
        if (collisionCheck(possx, possy, level)) {
            player.xpos = possx;
            player.ypos = possy;
            player.yvel = -player.yvel;
        } else {
            possx = player.xpos;
            possy = player.ypos + player.yvel;
            if (collisionCheck(possx, possy, level)) {
                player.xpos = possx;
                player.ypos = possy;
                player.xvel = -player.xvel;
            } else {
                possx = player.xpos;
                possy = player.ypos;
                player.xvel = -player.xvel;
                player.yvel = -player.yvel;
            }
        }
    }
    var friction = 1;
    if (getFloorTypeAt(player.xpos, player.ypos, level) == "field") {
        friction = 0.8;
    } else if (getFloorTypeAt(player.xpos, player.ypos, level) == "ice") {
        friction = 0.999;
    } else {
        friction = 0.999;
    }
    player.xvel *= friction;
    player.yvel *= friction;



    //----------------------- ATTACKS ------------------
    for (var i = 0; i < player.cooldowns.length; i++) {
        player.cooldowns[i]--;
        if (player.cooldowns[i] <= 0) player.cooldowns[i] = 0;
    }
    //Chef - Knife while Cooking, Fire while Cooking
    //Engineer - Knife intentionally
    //Fighter - Whip Knockback, Jetpack flame thrower 
    if (character == "engineer") {
        if (inventory.primary != "") {
            if (isPressing(KEY_CODES.lmb)) {
                if (player.cooldowns[0] <= 0) {
                    player.cooldowns[0] = player.maxcooldowns[0];
                    let xpos = player.xpos;
                    let ypos = player.ypos;
                    let facing = getPlayerFacing();
                    let range = 100;
                    let angle = Math.PI / 2;
                    let damage = 4;
                    let effect = "KNOCKBACK"
                    console.log("Attacking with SKATES");
                    damageField(xpos, ypos, facing, range, angle, damage, effect);
                    playAnim("skates", facing);
                }
            }
        }

    }
    if (character == "fighter") {
        //WHIP
        if (inventory.primary != "") {
            if (isPressing(KEY_CODES.lmb)) {
                if (player.cooldowns[0] <= 0) {
                    player.cooldowns[0] = player.maxcooldowns[0];
                    let xpos = player.xpos;
                    let ypos = player.ypos;
                    let facing = getPlayerFacing();
                    let range = 100;
                    let angle = Math.PI;
                    let damage = 4;
                    let effect = "KNOCKBACK"
                    console.log("Attacking with whip");
                    damageField(xpos, ypos, facing, range, angle, damage, effect);
                    playAnim("whip", facing);
                }
            }
        }
        if (inventory.secondary != "") {
            if (isPressing(KEY_CODES.rmb)) {
                if (player.cooldowns[1] <= 0) {
                    player.cooldowns[1] = player.maxcooldowns[1];
                    let xpos = player.xpos;
                    let ypos = player.ypos;
                    let facing = getPlayerFacing();
                    let range = 80;
                    let angle = Math.PI / 2;
                    let damage = 1;
                    let effect = "FIRE"
                    console.log("Attacking with fire");
                    damageField(xpos, ypos, facing, range, angle, damage, effect);
                    playAnim("fire", facing);
                }
            }
        }
    }





    //----------------------- TOOLS ---------------
    // Engineer grab things with grappling

    var pullstrength = 5;
    if (character == "engineer") {
        if (inventory.secondary != "") {
            if (isPressing(KEY_CODES.rmb)) {
                // if (player.cooldowns[1] <= 0) {
                //   player.cooldowns[1] = player.maxcooldowns[1];
                //Pull items
                var mousePos = getMousePos();
                var startx = player.xpos;
                var starty = player.ypos;
                var gx = mousePos.x;
                var gy = mousePos.y;
                var gradientX = startx - gx;
                var gradientY = starty - gy;
                var tdist = distance(gradientX, gradientY);
                var cube = getCubeAt(gx, gy)
                if (cube) {
                    cube.status = "alive";
                    if (isPressing(KEY_CODES.secondary)) {
                        cube.xvel = 0;
                        cube.yvel = 0;
                        if (getFloorTypeAt(cube.xpos, cube.ypos, level) == "button") {
                            delete world[cube.uniqueID];
                            cube.status = "removed";
                            player.worldinfluence[cube.uniqueID] = cube;
                            dropChestLoot(cube.xpos, cube.ypos, 4);
                        }
                    } else {
                        cube.xvel = gradientX / tdist * pullstrength;
                        cube.yvel = gradientY / tdist * pullstrength;
                    }
                    console.log("pulling cube");
                    player.worldinfluence[cube.uniqueID] = cube;
                }
                //}
            }
        }
    }

    var holdtimechange = 0.25;
    if (inventory.primary != "") {
        player.inventory.burntimes[0] -= holdtimechange;
    } else {
        player.inventory.burntimes[0] += holdtimechange;
        if (player.inventory.burntimes[0] > 100) player.inventory.burntimes[0] = 100;
    }
    if (inventory.secondary != "") {
        player.inventory.burntimes[1] -= holdtimechange;
    } else {
        player.inventory.burntimes[1] += holdtimechange;
        if (player.inventory.burntimes[1] > 100) player.inventory.burntimes[1] = 100;
    }
    if (inventory.movement != "") {
        player.inventory.burntimes[2] -= holdtimechange;
    } else {
        player.inventory.burntimes[2] += holdtimechange;
        if (player.inventory.burntimes[2] > 100) {
            player.inventory.burntimes[2] = 100;
            var movementAbility = "Grapple";
            if (character == "engineer") {
                movementAbility = "Jetpack";
            }
            if (character == "fighter") {
                movementAbility = "Skates";
            }
            if (movementAbility in world) {
                if (isPressing(KEY_CODES.chuck)) {
                    var cando = equipIfCan(movementAbility);
                    if (cando) {
                        console.log("Picked");
                        world[movementAbility].status = "removed";
                        player.worldinfluence[movementAbility] = world[movementAbility];
                    }
                }
            }
        }
    }

    if (isPressing(KEY_CODES.one) || player.inventory.burntimes[0] <= 0) {
        if (player.inventory.burntimes[0] <= 0) {
            takeDamage(10);
        }
        chuck(1);
    }
    if (isPressing(KEY_CODES.two) || player.inventory.burntimes[1] <= 0) {
        if (player.inventory.burntimes[1] <= 0) {
            takeDamage(10);
        }
        chuck(2);
    }
    if (isPressing(KEY_CODES.three) || player.inventory.burntimes[2] <= 0) {
        if (player.inventory.burntimes[2] <= 0) {
            takeDamage(10);
        }
        chuck(3);
    }


    if (isPressing(KEY_CODES.chuck)) {
        pickup();
    }

    var mposget = getMousePos();
    player.angle = Math.atan2(mposget.y - player.ypos, mposget.x - player.xpos);

    world[player.uniqueID] = player;
    removeDoors();

    monsterUpdate();

    otherPlayers();
    physics();
    enemies();
}


function monsterUpdate() {
    //take damge etc
    for (var worldID in world) {
        var obj = world[worldID];
        if (obj.type == "monster") {
            if (dist(obj.xpos, obj.ypos, player.xpos, player.ypos) < 5) {
                takeDamage(1);
            }
        }
    }
}



var cubesize = 32

function getCubeAt(xpos, ypos) {
    for (var worldID in world) {
        var obj = world[worldID];
        if (obj.type == "cube") {
            if (xpos >= obj.xpos && ypos >= obj.ypos && xpos <= obj.xpos + 32 && ypos <= obj.ypos + 32) {
                return obj;
            }
        }
    }
    return false;
}



function damageField(xpos, ypos, facing, range, angle, damage, effect) {
    for (var worldID in world) {
        var obj = world[worldID];
        if (obj.type == "monster") {
            if (obj.health > 0) {
                var mxpos = obj.xpos;
                var mypos = obj.ypos;
                //console.log("xpos:" + xpos + " ypos:" + ypos + " mxpos:" + mxpos + " mypos:" + mypos);
                if (dist(xpos, ypos, mxpos, mypos) < range) {
                    var facingAngle = Math.atan2(facing.y, facing.x);
                    var enemyAngle = Math.atan2(mypos - ypos, mxpos - xpos);
                    var angldiff = enemyAngle - facingAngle;
                    if (angldiff > Math.PI) angldiff -= Math.PI * 2;
                    if (angldiff < -Math.PI) angldiff += Math.PI * 2;
                    if (angldiff <= angle / 2) {
                        //DAMGE CAN BE GIVEN;
                        obj.health -= damage;
                        if (effect == "KNOCKBACK") {
                            obj.xvel = facing.x * 20;
                            obj.yvel = facing.y * 20;
                        }
                        if (obj.health > 0) {
                            obj.status = "alive";
                        } else {
                            obj.health = 0;
                            obj.status = "removed";
                            dropLoot(obj);
                        }

                        player.worldinfluence[worldID] = obj;
                    }
                }
            }
        }
    }
}

function dropLoot(monster) {
    var lootName = monster.monsterType;
    let id = randID();
    player.worldinfluence[id] = { uniqueID: id, type: lootName, status: "alive", xpos: monster.xpos, ypos: monster.ypos, xvel: 0, yvel: 0 };
}


function takeDamage(damageAmount) {
    player.health = player.health - damageAmount;
    if (player.health < 0) {
        displayMessage("you dead");
    }
}


function removeDoors() {
    for (let worldID in world) {
        if (worldID != player.uniqueID) {
            let object = world[worldID];
            if (object.type == "openDoor") {
                level[object.door1ID].locked = false;
                level[object.door2ID].locked = false;
            }
            if (object.type == "openChest") {
                level[object.chestID].locked = false;
            }
        }
    }
}



function useKey() {
    var doorSide1 = false;
    var doorSide2 = false;
    var chest = false;
    for (let li in level) {
        var door = level[li];
        if (door.type == "door") {
            if (door.locked) {
                var howfar = dist(player.xpos, player.ypos, door.x, door.y);
                if (howfar < 150) {
                    if (!doorSide1) {
                        doorSide1 = li;
                    } else if (!doorSide2) {
                        doorSide2 = li;
                    }
                }
            }
        }
        if (door.type == "chest") {
            if (door.locked) {
                var howfar = dist(player.xpos, player.ypos, door.x, door.y);
                if (howfar < 100) {
                    if (!chest) {
                        chest = li;
                    }
                }
            }
        }
    }
    if (doorSide1 && doorSide2) {
        let id = randID();
        level[doorSide1].locked = false;
        level[doorSide2].locked = false;
        player.worldinfluence[id] = { uniqueID: id, type: "openDoor", status: "alive", xpos: 0, ypos: 0, door1ID: doorSide1, door2ID: doorSide2 };
        return true;
    } else if (chest) {
        let id = randID();
        level[chest].locked = false;
        player.worldinfluence[id] = { uniqueID: id, type: "openChest", status: "alive", xpos: 0, ypos: 0, chestID: chest };
        dropChestLoot(level[chest].x + level[chest].w / 2, level[chest].y + level[chest].h / 2, 50);
        return true;
    }
    return false;
}


function dropChestLoot(x, y, range) {
    for (var i = 0; i < 5; i++) {
        var number = Math.floor(Math.random() * 3);
        var toDrop = "food";
        if (number == 1) {
            toDrop = "metal";
        }
        if (number == 2) {
            toDrop = "key";
        }
        var randomAngle = Math.random() * Math.PI * 2;
        var xvel = Math.cos(randomAngle) * range;
        var yvel = Math.sin(randomAngle) * range;
        var foodname = randID();
        let thrownitem = { uniqueID: foodname, type: toDrop, status: "alive", xpos: x + xvel, ypos: y + yvel, xvel: 0, yvel: 0 };
        console.log("Chest Loot");
        console.log(thrownitem);
        player.worldinfluence[foodname] = thrownitem;
    }
}



function playAnim(animname, facing) {
    if (animname == "chopping") {
        var animationObj = {
            name: animname,
            current: 0,
            max: 120,
            loop: false,
        }
        player.animations = animationObj;
    } else if (animname == "cooking") {
        var animationObj = {
            name: animname,
            current: 0,
            max: 120,
            loop: false,
        }
        player.animations = animationObj;
    } else if (animname == "fire") {
        var animationObj = {
            name: animname,
            current: 0,
            max: 10,
            loop: false,
            facing: facing
        }
        player.animations = animationObj;
    } else if (animname == "whip") {
        var animationObj = {
            name: animname,
            current: 0,
            max: 100,
            loop: false,
            facing: facing
        }
        player.animations = animationObj;
    }


}





function chuckFood(foodname) {
    var x = player.xpos;
    var y = player.ypos;
    var facing = getPlayerFacing();
    var xv = facing.x * 5;
    var yv = facing.y * 5;
    console.log("Chucking Food");
    let thrownitem = { uniqueID: foodname, type: "food", status: "alive", cooked: true, xpos: x, ypos: y, xvel: xv + player.xvel, yvel: yv + player.yvel };
    player.worldinfluence[foodname] = thrownitem;
}

function pickup() {
    let toremove = "";
    for (var worldID in world) {
        var obj = world[worldID];
        var type = obj.type;
        if (type == "item") {
            var canPick = false;
            if (!("status" in obj)) {
                canPick = true;
            } else {
                if (obj.status == "alive") {
                    canPick = true;
                }
            }
            if (canPick) {
                var thisDist = dist(obj.xpos, obj.ypos, player.xpos, player.ypos);
                if (thisDist < 80) {
                    console.log("Attempt Pickup");
                    console.log(obj);
                    var objname = obj.uniqueID;
                    var cando = equipIfCan(objname);
                    if (cando) {
                        console.log("Picked");
                        obj.status = "removed";
                        player.worldinfluence[obj.uniqueID] = obj;
                        world[worldID] = obj;
                    }
                }
            }
        }
        var thisDist = dist(obj.xpos, obj.ypos, player.xpos, player.ypos);
        if (thisDist < 35) {
            var canPick = false;
            if (!("status" in obj)) {
                canPick = true;
            } else {
                if (obj.status == "alive") {
                    canPick = true;
                }
            }
            if (canPick) {
                console.log("Attempt Pickup");
                console.log(obj);
                var objname = obj.uniqueID;
                var cando = false;
                if (type == "food") {
                    if (player.cooldowns[3] <= 0) {
                        cando = eat(obj);
                        if (cando) {
                            player.cooldowns[3] = player.maxcooldowns[3];
                            console.log("ate");
                        }
                    }
                }
                if (type == "metal") {
                    if (player.cooldowns[3] <= 0) {
                        cando = acquire(obj);
                        if (cando) {
                            player.cooldowns[3] = player.maxcooldowns[3];
                            console.log("ate metal");
                        }
                    }
                }
                if (type == "key") {
                    if (player.cooldowns[3] <= 0) {
                        cando = keyget(obj);
                        if (cando) {
                            player.cooldowns[3] = player.maxcooldowns[3];
                            console.log("got key");
                        }
                    }
                }
                if (cando) {
                    obj.status = "removed";
                    player.worldinfluence[obj.uniqueID] = obj;
                    world[worldID] = obj;
                }
            }
        }
    }
}

function acquire(obj) {
    if (character == "engineer") {
        player.inventory.items.push({ name: obj.uniqueID, type: "metal" });
        displayMessage("Metal Got")
        return true;
    }
    return false;
}

function keyget(obj) {
    if (character == "fighter") {
        player.inventory.items.push({ name: obj.uniqueID, type: "key" });
        displayMessage("Key Acquired!")
        return true;
    }
    return false;
}

function eat(obj) {
    if ("cooked" in obj) {
        player.health += 50;
        if (player.health > 100) {
            player.health = 100;
        }
        displayMessage("Ate Food")
        return true;
    }
    if (character == "chef") {
        player.inventory.items.push({ name: obj.uniqueID, type: "food", cooked: false, chopped: false });
        displayMessage("Unprepared Food Got")
        return true;
    }
    return false;
}

function equipIfCan(objname) {
    var inventory = player.inventory;
    if (character == "chef") {
        if (objname == "Jetpack") {
            inventory.primary = objname;
            return true;
        }
        if (objname == "Skates") {
            inventory.secondary = objname;
            return true;
        }
        if (objname == "Grapple") {
            inventory.movement = objname;
            return true;
        }
    }
    if (character == "fighter") {
        if (objname == "Jetpack") {
            inventory.secondary = objname;
            return true;
        }
        if (objname == "Skates") {
            inventory.movement = objname;
            return true;
        }
        if (objname == "Grapple") {
            inventory.primary = objname;
            return true;
        }
    }
    if (character == "engineer") {
        if (objname == "Jetpack") {
            inventory.movement = objname;
            return true;
        }
        if (objname == "Skates") {
            inventory.primary = objname;
            return true;
        }
        if (objname == "Grapple") {
            inventory.secondary = objname;
            return true;
        }
    }
    return false;
}

function getPlayerFacing() {
    var grapplePos = getMousePos();
    var xpos = player.xpos;
    var ypos = player.ypos;
    var dx = grapplePos.x - xpos;
    var dy = grapplePos.y - ypos;
    var ropeLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    dx = dx / ropeLength;
    dy = dy / ropeLength;
    return { x: dx, y: dy };
}


function chuck(slotnumber) {
    let inventory = player.inventory;
    var x = player.xpos;
    var y = player.ypos;
    var facing = getPlayerFacing();
    var speed = 8;
    var xv = facing.x * speed;
    var yv = facing.y * speed;
    if (slotnumber == 1) {
        if (inventory.primary != "") {
            console.log("Chucking " + slotnumber);
            let thrownitem = { uniqueID: inventory.primary, type: "item", status: "alive", xpos: x, ypos: y, xvel: xv + player.xvel, yvel: yv + player.yvel };
            player.worldinfluence[inventory.primary] = thrownitem;
            inventory.primary = "";
        }
    }
    if (slotnumber == 2) {
        if (inventory.secondary != "") {
            console.log("Chucking " + slotnumber);
            let thrownitem = { uniqueID: inventory.secondary, type: "item", status: "alive", xpos: x, ypos: y, xvel: xv + player.xvel, yvel: yv + player.yvel };
            player.worldinfluence[inventory.secondary] = thrownitem;
            inventory.secondary = "";
        }
    }
    if (slotnumber == 3) {
        if (inventory.movement != "") {
            console.log("Chucking " + slotnumber);
            let thrownitem = { uniqueID: inventory.movement, type: "item", status: "alive", xpos: x, ypos: y, xvel: xv + player.xvel, yvel: yv + player.yvel };
            player.worldinfluence[inventory.movement] = thrownitem;
            inventory.movement = "";
        }
    }
}



function otherPlayers() {


}

function physics() {

}