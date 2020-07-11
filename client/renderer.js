// handles rendering visuals of the game


var prevPositions = {};
var lastmessage = 0;
var maxDisplayTime = 2000;
var currentMessage = "";

function displayMessage(message) {
    currentMessage = message;
    lastmessage = getCurrentTime();
}



function draw(interp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
            var inv = object.inventory;
            if (localUsername == object.uniqueID) {
                if (getCurrentTime() - lastmessage < maxDisplayTime) {
                    ctx.font = "20px Calibri";
                    ctx.fillStyle = "#000000";
                    var messageWidth = ctx.measureText(currentMessage).width;
                    ctx.fillText(currentMessage, useX + 12 - messageWidth / 2, useY - 12);
                }
            }
            if (inv.primary != "") {
                ctx.fillStyle = "#9400D3";
                ctx.fillRect(useX - 4, useY - 10, 10, 10);
            }
            if (inv.secondary != "") {
                ctx.fillStyle = "#9400D3";
                ctx.fillRect(useX + 7, useY - 10, 10, 10);
            }
            if (inv.movement != "") {
                ctx.fillStyle = "#9400D3";
                ctx.fillRect(useX + 18, useY - 10, 10, 10);
            }
            if (playerclass == "chef") {
                if ("grappling" in object) {
                    ctx.beginPath();
                    ctx.moveTo(useX, useY);
                    var mouse = object.grappling;
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
                ctx.font = "12px Calibri";
                ctx.fillStyle = "#00FF00";
                var carryingFood = player.inventory.items.length + " food";
                var messagemeasurement = ctx.measureText(carryingFood);
                ctx.fillText(carryingFood, useX + 12 - messagemeasurement.width / 2, useY + 26 + 12);
                ctx.fillStyle = "#00FF00";
            }
            if (playerclass == "engineer") {
                ctx.fillStyle = "#0000FF";
            }
            if (playerclass == "fighter") {
                ctx.fillStyle = "#FF0000";
            }
            ctx.fillRect(useX, useY, 24, 24);

            ctx.fillStyle = "#ff6961";
            let healthprogress = object.health / maxhealth;
            ctx.fillRect(useX - 8, useY + 24 - healthprogress * 24, 7, healthprogress * 24);

        } else if (object.type == "item") {
            ctx.fillStyle = "#FFA500";
            ctx.fillRect(useX, useY, 5, 5);
        } else if (object.type == "food") {
            ctx.fillStyle = "#66FF66";
            ctx.fillRect(useX, useY, 8, 8);
        }
        if ("animations" in object) {
            var anim = object.animations;
            var n = anim.name;
            var c = anim.current;
            var max = anim.max;
            if (c <= max) {
                c++;
                anim.current = c;
            } else {
                if (anim.loop) {
                    anim.current = 0;
                } else {
                    anim = {
                        name: "",
                        current: 0,
                        max: 0,
                    };
                }
            }
            displayAnimation(n, c / max, useX, useY);
            object.animations = anim;
        }
    }
}


function displayAnimation(animName, progress, x, y) {
    if (animName == "chopping") {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI * 2 * progress);
        ctx.fillStyle = "#808080";
        ctx.fillRect(24, 0, 12, 3);
        ctx.restore();
    }
    if (animName == "cooking") {
        ctx.save();
        var grd = ctx.createRadialGradient(x, y, progress * 50, x, y, 50);
        grd.addColorStop(0, "#FFA500");
        grd.addColorStop(1, "white");

        // Fill with gradient
        ctx.fillStyle = grd;
        ctx.moveTo(x, y);
        ctx.beginPath();
        ctx.arc(x, y, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}