//HTML/Canvas
var ctx;
var canvas;
canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");

//Networking
var serverIP = "localhost"
var serverPort = ":32457";
var localUsername = getQueryVariable("username");
var character = getQueryVariable("character");
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



//useful functions
function randColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
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