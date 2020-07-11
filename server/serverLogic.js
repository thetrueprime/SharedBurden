module.exports = {
    mainLoop: function(world) {
        for (var worldID in world) {
            var obj = world[worldID];
            var type = obj.type;
            if (type == "player") {

            } else if (type == "item") {
                var nextX = obj.xpos + obj.xvel;
                var nextY = obj.ypos + obj.yvel;
                if (nextX > 0 && nextX < 1000 && nextY > 0 && nextY < 1000) {
                    obj.xpos = nextX;
                    obj.ypos = nextY;
                } else {
                    obj.xvel = -obj.xvel;
                    obj.yvel = -obj.yvel;
                }
            } else if (type == "monster") {

            }
        }
        return world;
    },
}