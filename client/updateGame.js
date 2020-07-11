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
    //CHEF
    if (character == "chef") {
        if (inventory.movement != "") {
            var grapplePos = getMousePos();
            isGrappling = false;
            if (getFloorTypeAt(grapplePos.x, grapplePos.y) == "grappleBlock") {
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

                    player.xvel += centralBoostx;
                    player.yvel += centralBoosty;
                }
            }
        }
        if (isGrappling) {
            player.grappling = getMousePos();
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
                                displayMessage("Cooking Food!");
                                item.cooked = true;
                                chuckFood(item.name);
                                toremove = itemid;
                                playAnim("cooking");
                                break;
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
                                displayMessage("Chopping Food!");
                                item.chopped = true;
                                playAnim("chopping");
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    //Engineer
    var maxspeed = 0;
    if (character == "engineer") {
        if (inventory.movement != "") {
            if (isPressing(KEY_CODES.up)) {
                player.yvel -= 0.1;
            }
            if (isPressing(KEY_CODES.down)) {
                player.yvel += 0.1;
            }
            if (isPressing(KEY_CODES.right)) {
                player.xvel += 0.1;
            }
            if (isPressing(KEY_CODES.left)) {
                player.xvel -= 0.1;
            }
        }
    }
    if (character == "fighter") {
        if (inventory.movement != "") {
            var ismoving = false;
            if (isPressing(KEY_CODES.up)) {
                player.yvel -= 0.1;
                ismoving = true;
            }
            if (isPressing(KEY_CODES.down)) {
                player.yvel += 0.1;
                ismoving = true;
            }
            if (isPressing(KEY_CODES.right)) {
                player.xvel += 0.1;
                ismoving = true;
            }
            if (isPressing(KEY_CODES.left)) {
                player.xvel -= 0.1;
                ismoving = true;
            }
            if (!ismoving) {
                player.xvel *= 0.9;
                player.yvel *= 0.9;
            }
        }
    }


    var possx = player.xpos + player.xvel;
    var possy = player.ypos + player.yvel;

    if (collisionCheck(possx, possy)) {
        player.xpos = possx;
        player.ypos = possy;
    } else {
        possx = player.xpos + player.xvel;
        possy = player.ypos;
        if (collisionCheck(possx, possy)) {
            player.xpos = possx;
            player.ypos = possy;
            player.yvel = -player.yvel;
        } else {
            possx = player.xpos;
            possy = player.ypos + player.yvel;
            if (collisionCheck(possx, possy)) {
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
    if (getFloorTypeAt(player.xpos, player.ypos) == "field") {
        player.xvel *= 0.8;
        player.yvel *= 0.8;
    }



    if (isPressing(KEY_CODES.one)) {
        chuck(1);
    }
    if (isPressing(KEY_CODES.two)) {
        chuck(2);
    }
    if (isPressing(KEY_CODES.three)) {
        chuck(3);
    }

    if (isPressing(KEY_CODES.chuck)) {
        pickup();
    }



    world[player.uniqueID] = player;


    otherPlayers();
    physics();
    enemies();
}


function playAnim(animname) {
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
            max: 1200,
            loop: false,
        }
        player.animations = animationObj;
    }


}





function chuckFood(foodname) {
    var x = player.xpos;
    var y = player.ypos;
    var facing = getPlayerFacing();
    var xv = facing.x;
    var yv = facing.y;
    console.log("Chucking Food");
    let thrownitem = { uniqueID: foodname, type: "food", status: "alive", xpos: x, ypos: y, xvel: xv + player.xvel, yvel: yv + player.yvel };
    player.worldinfluence[foodname] = thrownitem;
}

function pickup() {
    let toremove = "";
    for (var worldID in world) {
        var obj = world[worldID];
        var type = obj.type;
        if (type == "item") {
            var thisDist = dist(obj.xpos, obj.ypos, player.xpos, player.ypos);
            if (thisDist < 35) {
                console.log("Attempt Pickup");
                console.log(obj);
                var objname = obj.uniqueID;
                var cando = equipIfCan(objname);
                if (cando) {
                    console.log("Picked");
                    obj.status = "removed";
                    player.worldinfluence[obj.uniqueID] = obj;
                }
            }
        }
        if (type == "food") {
            var thisDist = dist(obj.xpos, obj.ypos, player.xpos, player.ypos);
            if (thisDist < 35) {
                console.log("Attempt Pickup");
                console.log(obj);
                var objname = obj.uniqueID;
                var cando = eat(objname);
                if (cando) {
                    console.log("ate");
                    obj.status = "removed";
                    player.worldinfluence[obj.uniqueID] = obj;
                }
            }
        }
    }
}

function eat(objname) {
    player.health += 50;
    if (player.health > 100) {
        player.health = 100;
    }
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
    var xv = facing.x;
    var yv = facing.y;
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


function collisionCheck(possx, possy) {
    //TODO
    if (possx && possy) {
        var terrain = getFloorAt(possx, possy);
        if (terrain !== undefined) {
            var type = terrain.type;
            if (type == "solid") {
                console.log("Colliding");
                return false;
            }
            if (type == "door") {
                if (terrain.locked) {
                    console.log("Colliding");
                    return false;
                }
            }
        }
    }
    return true;
}