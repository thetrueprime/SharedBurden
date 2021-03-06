var KEY_CODES = {
    right: "KeyD",
    left: "KeyA",
    up: "KeyW",
    down: "KeyS",
    chuck: "KeyF",
    one: "Digit1",
    two: "Digit2",
    three: "Digit3",
    lmb: "M0",
    rmb: "M2",
    primary: "KeyE",
    secondary: "KeyQ"
}

function isPressing(code) {
    return !!this.keys.get(code);
}


var keys = new Map()
keys.set(KEY_CODES.up, false)
keys.set(KEY_CODES.down, false)
keys.set(KEY_CODES.left, false)
keys.set(KEY_CODES.right, false)
keys.set(KEY_CODES.chuck, false)
keys.set(KEY_CODES.one, false)
keys.set(KEY_CODES.two, false)
keys.set(KEY_CODES.three, false)
keys.set(KEY_CODES.rmb, false)
keys.set(KEY_CODES.lmb, false)
keys.set(KEY_CODES.primary, false)
keys.set(KEY_CODES.secondary, false)
var mx, my = 0;


function getMousePos() {
    var canvasMX = mx;
    var canvasMY = my;
    var diffMidX = canvasMX - canvas.width / 2;
    var diffMidY = canvasMY - canvas.height / 2;
    var scaledDiffMidX = diffMidX / scale;
    var scaledDiffMidY = diffMidY / scale;
    var newPosX = camerax + scaledDiffMidX;
    var newPosY = cameray + scaledDiffMidY;

    return { x: newPosX, y: newPosY };
}

document.body.addEventListener('keydown', (event) => {
    // console.log(event.code);
    keys.set(event.code, true);
})
document.body.addEventListener('keyup', (event) => {
    keys.set(event.code, false);
})
canvas.addEventListener('mousedown', (event) => {
    //console.log(event.button);
    keys.set("M" + event.button, true);
})
canvas.addEventListener('mouseup', (event) => {
    keys.set("M" + event.button, false);
})
canvas.addEventListener('mousemove', (event) => {
    mx = event.clientX;
    my = event.clientY;
})