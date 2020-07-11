// handles rendering visuals of the game


var prevPositions = {};


function draw(interp) {

    for (let worldID in world) {
        let object = world[worldID];
        let prevx = object.xpos;
        let prevy = object.ypos;
        let xpos = object.xpos;
        let ypos = object.ypos;
        if (worldID in prevPositions) {
            var prevPos = prevPositions[worldID];
            prevx = prevPos.xpos;
            prevy = prevPos.ypos;
        }
        prevPositions[worldID] = { xpos: xpos, ypos: ypos };

        var useX = (xpos - prevx) * interp + prevx;
        var useY = (ypos - prevy) * interp + prevy;

        ctx.fillStyle = "#00FF00";
        if (object.type == "player") {
            var playerclass = object.class;
            if (playerclass == "chef") {
                ctx.fillStyle = "#00FF00";
            }
            if (playerclass == "engineer") {
                ctx.fillStyle = "#0000FF";
            }
            if (playerclass == "fighter") {
                ctx.fillStyle = "#FF0000";
            }
        }
        ctx.fillRect(useX, useY, 5, 5);

    }
}