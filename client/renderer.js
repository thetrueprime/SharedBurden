// handles rendering visuals of the game


var prevPositions = {};
var lastmessage = 0;
var maxDisplayTime = 2000;
var currentMessage = "";

function displayMessage(message) {
    currentMessage = message;
    lastmessage = getCurrentTime();
}


class TerrainManager {
    constructor(src) {
        if (typeof Image !== 'undefined') {
            this.image = new Image();
            this.image.src = src;
        }
        this.sx = 0;
        this.sy = 0;
        this.tileWidth = 24;
        this.type = '9'
    }

    drawTilesImage(ctx, x, y, width, height, scale) {
        var displaywidth = this.tileWidth / scale;
        var maxx = width / (displaywidth) - 1;
        var maxy = height / (displaywidth) - 1;
        for (var xit = 0; xit <= (maxx); xit++) {
            for (var yit = 0; yit <= (maxy); yit++) {
                var tileXOffset = displaywidth * xit;
                var tileYOffset = displaywidth * yit;
                if (this.type == 'tile') {
                    ctx.drawImage(this.image, this.sx + this.tileWidth, this.sy + this.tileWidth, this.tileWidth, this.tileWidth, x + tileXOffset, y + tileYOffset, displaywidth, displaywidth);
                } else
                if (this.type == 'full') {
                    ctx.drawImage(this.image, 0, 0, this.tileWidth, this.tileWidth, x + tileXOffset, y + tileYOffset, displaywidth, displaywidth);
                } else if (this.type == '9') {
                    if (xit == 0) {
                        if (yit != 0) {
                            if (yit == maxy) {
                                ctx.drawImage(this.image, this.sx, this.sy + this.tileWidth * 2, this.tileWidth, this.tileWidth, x + tileXOffset, y + tileYOffset, displaywidth, displaywidth);
                            } else {
                                ctx.drawImage(this.image, this.sx, this.sy + this.tileWidth * 1, this.tileWidth, this.tileWidth, x + tileXOffset, y + tileYOffset, displaywidth, displaywidth);
                            }
                        } else {
                            ctx.drawImage(this.image, this.sx, this.sy, this.tileWidth, this.tileWidth, x, y, displaywidth, displaywidth);
                        }
                    } else if (yit == 0) {
                        if (xit == maxx) {
                            ctx.drawImage(this.image, this.sx + this.tileWidth * 2, this.sy, this.tileWidth, this.tileWidth, x + tileXOffset, y + tileYOffset, displaywidth, displaywidth);
                        } else {
                            ctx.drawImage(this.image, this.sx + this.tileWidth * 1, this.sy, this.tileWidth, this.tileWidth, x + tileXOffset, y + tileYOffset, displaywidth, displaywidth);
                        }
                    } else if (yit == maxy) {
                        if (xit == maxx) {
                            ctx.drawImage(this.image, this.sx + this.tileWidth * 2, this.sy + this.tileWidth * 2, this.tileWidth, this.tileWidth, x + tileXOffset, y + tileYOffset, displaywidth, displaywidth);
                        } else {
                            ctx.drawImage(this.image, this.sx + this.tileWidth * 1, this.sy + this.tileWidth * 2, this.tileWidth, this.tileWidth, x + tileXOffset, y + tileYOffset, displaywidth, displaywidth);
                        }
                    } else if (xit == maxx) {
                        if (yit == maxy) {
                            ctx.drawImage(this.image, this.sx + this.tileWidth * 2, this.sy + this.tileWidth * 2, this.tileWidth, this.tileWidth, x + tileXOffset, y + tileYOffset, displaywidth, displaywidth);
                        } else {
                            ctx.drawImage(this.image, this.sx + this.tileWidth * 2, this.sy + this.tileWidth * 1, this.tileWidth, this.tileWidth, x + tileXOffset, y + tileYOffset, displaywidth, displaywidth);
                        }
                    } else {
                        ctx.drawImage(this.image, this.sx + this.tileWidth * 1, this.sy + this.tileWidth * 1, this.tileWidth, this.tileWidth, x + tileXOffset, y + tileYOffset, displaywidth, displaywidth);
                    }
                }
            }
        }
    }

}

var floor = new TerrainManager('images/tempfloor.png')
floor.type = "full";
floor.tileWidth = 128;

function drawTerrain() {
    for (floorID in level) {
        var flooring = level[floorID];
        var type = flooring.type;
        if (type == "field") {
            ctx.fillStyle = "#35654d";
        }
        if (type == "door") {
            if (!flooring.locked) {
                ctx.fillStyle = "#FFFFFF";
            } else {
                ctx.fillStyle = "#35654d";
            }
        }
        if (type == "grappleBlock") {
            ctx.fillStyle = "#654321";
        }
        if (type == "solid") {
            ctx.fillStyle = "#808000";
        }
        ctx.fillRect(flooring.x, flooring.y, flooring.w, flooring.h);
        if (type == "cobblefloor") {
            floor.drawTilesImage(ctx, flooring.x, flooring.y, flooring.w, flooring.h, 2);
        }
    }
}


var loadedTextures = {};

var texturesToLoad = [
    { src: "images/first.png", key: "Swords" },
    { src: "images/gamejam_skates_pink.png", key: "Skates" },
    { src: "images/gamejam_jetpack.png", key: "Jetpack" },
    { src: "images/gamejam_grapplinghook.png", key: "Grapple" }
]

function loadImages() {
    for (let imageData of texturesToLoad) {
        let img = new Image();
        img.src = imageData.src;
        img.onload = function() {
            loadedTextures[imageData.key] = img;
            console.log("Loaded " + imageData.key);
        }
    }
}
loadImages();

var scale = 1.5;

var camerax = 0;
var cameray = 0;

function draw(interp) {
    ctx.restore();
    ctx.clearRect(0, 0, canvas.width, canvas.height); {
        let object = world[player.uniqueID];
        let prevx = object.xpos;
        let prevy = object.ypos;
        let xpos = object.xpos;
        let ypos = object.ypos;
        if (player.uniqueID in prevPositions) {
            var prevPos = prevPositions[player.uniqueID];
            prevx = prevPos.xpos;
            prevy = prevPos.ypos;
        }
        camerax = (xpos - prevx) * interp + prevx;
        cameray = (ypos - prevy) * interp + prevy;
    }
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-camerax, -cameray);

    drawTerrain();



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
                    ctx.fillText(currentMessage, useX + 12 - messageWidth / 2, useY - 21);
                }
            }
            if (inv.primary != "") {
                ctx.fillStyle = "#9400D3";
                ctx.fillRect(useX - 18, useY - 20, 20, 20);
                textureName = inv.primary;
                if (textureName in loadedTextures) {
                    ctx.drawImage(loadedTextures[textureName], useX - 18, useY - 20, 20, 20);
                }
            } else {
                ctx.strokeStyle = "#9400D3";
                ctx.beginPath();
                ctx.rect(useX - 18, useY - 20, 20, 20);
                ctx.stroke();
            }
            ctx.fillStyle = "#00FF00";
            ctx.fillRect(useX - 18, useY - 25, 20 * object.inventory.burntimes[0] / 100, 5);
            if (inv.secondary != "") {
                ctx.fillStyle = "#9400D3";
                ctx.fillRect(useX + 2, useY - 20, 20, 20);
                textureName = inv.secondary;
                if (textureName in loadedTextures) {
                    ctx.drawImage(loadedTextures[textureName], useX + 2, useY - 20, 20, 20);
                }
            } else {
                ctx.strokeStyle = "#9400D3";
                ctx.beginPath();
                ctx.rect(useX + 2, useY - 20, 20, 20);
                ctx.stroke();
            }
            ctx.fillStyle = "#00FF00";
            ctx.fillRect(useX + 2, useY - 25, 20 * object.inventory.burntimes[1] / 100, 5);
            if (inv.movement != "") {
                ctx.fillStyle = "#9400D3";
                ctx.fillRect(useX + 24, useY - 20, 20, 20);
                textureName = inv.movement;
                if (textureName in loadedTextures) {
                    ctx.drawImage(loadedTextures[textureName], useX + 24, useY - 20, 20, 20);
                }
            } else {
                ctx.strokeStyle = "#9400D3";
                ctx.beginPath();
                ctx.rect(useX + 24, useY - 20, 20, 20);
                ctx.stroke();
            }
            ctx.fillStyle = "#00FF00";
            ctx.fillRect(useX + 24, useY - 25, 20 * object.inventory.burntimes[2] / 100, 5);
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
            ctx.fillRect(useX, useY, 15, 15);
            textureName = object.uniqueID;
            if (textureName in loadedTextures) {
                ctx.drawImage(loadedTextures[textureName], useX, useY, 15, 15);
            }
        } else if (object.type == "food") {
            ctx.fillStyle = "#66FF66";
            ctx.fillRect(useX, useY, 8, 8);
        } else if (object.type == "monster") {
            ctx.fillStyle = "#FCFC1D";
            ctx.fillRect(useX, useY, 35, 35);
            ctx.fillStyle = "#FF0000";
            ctx.fillRect(useX, useY - 5, 35 * object.health / object.maxhealth, 5);
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
    mouspos = getMousePos();
    ctx.fillStyle = "#000000";
    ctx.fillRect(mouspos.x, mouspos.y, 1, 1);
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