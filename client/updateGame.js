var futureNPositions = {};







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
            if (isPressing(KEY_CODES.lmb)) {
                var grapplePos = getMousePos();
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
                var grapplePos = getMousePos();
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


function pickup() {
    let toremove = "";
    for (var worldID in world) {
        var obj = world[worldID];
        var type = obj.type;
        if (type == "item") {
            var thisDist = distance(obj.xpos, obj.ypos, player.xpos, player.ypos);
            if (thisDist < 20) {
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
            let thrownitem = { uniqueID: inventory.primary, type: "item", status: "alive", xpos: x, ypos: y, xvel: xv, yvel: yv };
            player.worldinfluence[inventory.primary] = thrownitem;
            inventory.primary = "";
        }
    }
    if (slotnumber == 2) {
        if (inventory.secondary != "") {
            console.log("Chucking " + slotnumber);
            let thrownitem = { uniqueID: inventory.secondary, type: "item", status: "alive", xpos: x, ypos: y, xvel: xv, yvel: yv };
            player.worldinfluence[inventory.secondary] = thrownitem;
            inventory.secondary = "";
        }
    }
    if (slotnumber == 3) {
        if (inventory.movement != "") {
            console.log("Chucking " + slotnumber);
            let thrownitem = { uniqueID: inventory.movement, type: "item", status: "alive", xpos: x, ypos: y, xvel: xv, yvel: yv };
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
        return true;
    }
    return true;
}