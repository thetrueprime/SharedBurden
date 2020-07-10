module.exports = {
    mainLoop: function(world) {
        for (var worldID in world) {
            var obj = world[worldID];
            var type = obj.type;
            if (type == "player") {

            } else if (type == "item") {
                obj.xpos = obj.xpos + obj.xvel;
                obj.ypos = obj.ypos + obj.yvel;

            } else if (type == "monster") {

            }
        }
        return world;
    },
}