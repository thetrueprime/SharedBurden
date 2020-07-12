//HTML/Canvas
var ctx;
var canvas;
canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

//Networking
var serverIP = getQueryVariable("ip")
var serverPort = ":32457";
var localUsername = getQueryVariable("username");
var character = getQueryVariable("character");
if (!serverIP) {
    throw ("no ip input \n Please Relog.")
}
if (!localUsername) {
    throw ("no username selected, unexpected results could occur. \n Please Relog.")
}

if (!character) {
    throw ("no character selected, unexpected results could occur. \n Please Relog.")
}

var connection;

//Game Loop
var requested = false;
var drawing = true;
var MAX_FRAMESKIP = 5;
var next_game_tick = getCurrentTime();
var loops = 0;
var interpolation = 0;
var TICKS_PER_SECOND = 20;
var SKIP_TICKS = 1000 / TICKS_PER_SECOND;


//constants
var maxhealth = 100;

//instance
var player = newPlayer();
var world = {};
var level = {};




//useful functions
function randColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function randID() {
    return "#" + Math.floor(Math.random() * 16777215) + getCurrentTime();
}

function chance(over, amount) {
    var random = Math.random;
    var option = Math.round((random / over) * amount);
    return option;
}


function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
}


function distance(dx, dy) {
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

function dist(sx, sy, ex, ey) {
    return distance(ex - sx, ey - sy);
}

function getCurrentTime() {
    return Date.now();
}

function rayTrace(sx, sy, ex, ey, level) {
    var bestRayV = 10000;
    var bestRay = false;
    for (var ti in level) {
        var ta = level[ti];
        if (ta.type == "solid" || ta.type == "grappleBlock") {
            var ray = aabbContainsSegment(sx, sy, ex, ey, ta.x, ta.y, ta.x + ta.w, ta.y + ta.h)
            if (ray) {
                ray.terrain = ta;
                var tdist = Math.sqrt(Math.pow(ray.x - sx, 2) + Math.pow(ray.y - sy, 2));
                if (tdist < bestRayV) {
                    bestRayV = tdist;
                    bestRay = ray;
                }
            }
        }
    }
    return bestRay;
}

function aabbContainsSegment(x1, y1, x2, y2, minX, minY, maxX, maxY) {
    // Completely outside.
    if ((x1 <= minX && x2 <= minX) || (y1 <= minY && y2 <= minY) || (x1 >= maxX && x2 >= maxX) || (y1 >= maxY && y2 >= maxY))
        return false;

    var m = (y2 - y1) / (x2 - x1);
    var toreturn = false;
    var bestdist = dist(x1, y1, x2, y2);



    var x = (minY - y1) / m + x1;
    var px = x;
    var py = minY;
    var thisdistance = distance(py - y1, px - x1);
    if (x > minX && x < maxX) {
        if (thisdistance <= bestdist) {
            toreturn = { x: x, y: minY };
            bestdist = thisdistance
        }
    };

    x = (maxY - y1) / m + x1;
    px = x;
    py = maxY;
    thisdistance = distance(py - y1, px - x1);
    if (x > minX && x < maxX) {
        if (thisdistance <= bestdist) {
            toreturn = { x: x, y: maxY };
            bestdist = thisdistance
        }
    };

    var y = m * (minX - x1) + y1;
    px = minX;
    py = y;
    thisdistance = distance(py - y1, px - x1);
    if (y > minY && y < maxY) {
        if (thisdistance <= bestdist) {
            toreturn = { x: minX, y: y };
            bestdist = thisdistance
        }
    };

    y = m * (maxX - x1) + y1;
    px = maxX;
    py = y;
    thisdistance = distance(py - y1, px - x1);
    if (y > minY && y < maxY) {
        if (thisdistance <= bestdist) {
            toreturn = { x: maxX, y: y };
            bestdist = thisdistance
        }
    };


    return toreturn;
}