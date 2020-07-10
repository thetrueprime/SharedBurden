function update() {

    ///MOVEMENT
    let inventory = player.inventory;
    //CHEF
    if (character == "Chef") {
        if (inventory.movement != "") {

        }
    }

    //Engineer
    var maxspeed = 0;
    if (character == "Engineer") {
        if (inventory.movement != "") {
            //Game running
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
                player.yvel -= 0.1;
            }
        }
    }



    var possx = player.xpos + player.xvel;
    var possy = player.ypos + player.yvel;

    if (collisionCheck(possx, possy)) {
        player.xpos = possx;
        player.ypos = possy;
    }
    enemies();
}





function collisionCheck(possx, possy) {
    //TODO
    if (possx && possy) {
        return true;
    }

}