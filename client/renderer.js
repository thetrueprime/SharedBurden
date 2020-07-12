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

var floor = new TerrainManager('images/gamejam_room.png')
floor.type = "full";
floor.tileWidth = 128;

function drawTerrain() {
    for (floorID in level) {
        var flooring = level[floorID];
        var type = flooring.type;
        var draw = true;
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
            draw = false;
        }
        if (draw) ctx.fillRect(flooring.x, flooring.y, flooring.w, flooring.h);
        if (type == "cobblefloor") {
            floor.drawTilesImage(ctx, flooring.x, flooring.y, flooring.w, flooring.h, 0.25);
        }
    }
}


var loadedTextures = {};

var texturesToLoad = [
    { src: "images/first.png", key: "Swords" },
    { src: "images/gamejam_skates_pink.png", key: "Skates" },
    { src: "images/gamejam_jetpack.png", key: "Jetpack" },
    { src: "images/gamejam_grapplinghook.png", key: "Grapple" },
    { src: "images/flame_step_1.png", key: "fire" }
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
                var carryingFood = countItem(player.inventory.items, "food") + " food";
                var messagemeasurement = ctx.measureText(carryingFood);
                ctx.fillText(carryingFood, useX + 12 - messagemeasurement.width / 2, useY + 26 + 12);
                ctx.fillStyle = "#00FF00";
            }
            if (playerclass == "engineer") {
                ctx.font = "12px Calibri";
                ctx.fillStyle = "#00FF00";
                var carryingFood = countItem(player.inventory.items, "metal") + " metal";
                var messagemeasurement = ctx.measureText(carryingFood);
                ctx.fillText(carryingFood, useX + 12 - messagemeasurement.width / 2, useY + 26 + 12);
                ctx.fillStyle = "#0000FF";
            }
            if (playerclass == "fighter") {
                ctx.font = "12px Calibri";
                ctx.fillStyle = "#00FF00";
                var carryingFood = countItem(player.inventory.items, "key") + " key";
                var messagemeasurement = ctx.measureText(carryingFood);
                ctx.fillText(carryingFood, useX + 12 - messagemeasurement.width / 2, useY + 26 + 12);
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
            var facingX = 0;
            var facingY = 0;
            if ("facing" in anim) {
                facingX = anim.facing.x;
                facingY = anim.facing.y;
            }
            displayAnimation(n, c / max, useX, useY, facingX, facingY);
            object.animations = anim;
        }
    }
    drawParticles();
    mouspos = getMousePos();
    ctx.fillStyle = "#000000";
    ctx.fillRect(mouspos.x, mouspos.y, 1, 1);
}

function countItem(items, typeofthing) {
    var tally = 0;
    for (let item of items) {
        if (item.type == typeofthing) {
            tally++;
        }
    }
    return tally;
}

let particles = {};

function drawParticles() {
    let toremove = [];
    for (let particleID in particles) {
        let particle = particles[particleID];
        let imageName = particle.imageName;
        if (imageName == "fire") {
            ctx.save();
            ctx.drawImage(loadedTextures["fire"], particle.x, particle.y, 16, 16);
            ctx.restore();
        }
        particle.x += particle.xv;
        particle.y += particle.yv;
        particle.timeremaining--;
        if (particle.timeremaining < 0) {
            toremove.push(particle.uniqueID);
        }
        particles[particleID] = particle;
    }
    for (let removeID of toremove) {
        delete particles[removeID];
    }
}

function displayAnimation(animName, progress, x, y, fx, fy) {
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
        if (Math.round(progress * 120) % 20 == 0) {
            var maxcircle = 20;
            for (var i = 0; i < maxcircle; i++) {
                var angle = i / maxcircle * Math.PI * 2;
                var newID = randID();
                var randSpeed = 0.5;
                var vx = Math.cos(angle) * randSpeed;
                var vy = Math.sin(angle) * randSpeed;

                particles[newID] = {
                    uniqueID: newID,
                    imageName: "fire",
                    x: x,
                    y: y,
                    xv: vx,
                    yv: vy,
                    timeremaining: 100
                }
            }
        }
        ctx.restore();

    }
    if (animName == "fire") {
        ctx.save();
        for (var i = 0; i < 5; i++) {
            var newID = randID();
            var randSpeed = Math.random();
            var vx = fx * randSpeed;
            var vy = fy * randSpeed;
            var angle = Math.atan2(vy, vx);
            var randomangle = Math.PI / 6;
            angle = angle + (Math.random() - 0.5) * randomangle;
            vx = randSpeed * Math.cos(angle);
            vy = randSpeed * Math.sin(angle);

            particles[newID] = {
                uniqueID: newID,
                imageName: "fire",
                x: x,
                y: y,
                xv: vx,
                yv: vy,
                timeremaining: 100
            }
        }
        ctx.restore();
    }
}