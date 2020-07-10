var KEY_CODES = {
    right: "KeyD",
    left: "KeyA",
    up: "KeyW",
    down: "KeyS",
    chuck: "KeyF",
    lmb: "0",
    rmb: "1"
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
keys.set(KEY_CODES.rmb, false)
keys.set(KEY_CODES.lmb, false)
var mx, my = 0;

document.body.addEventListener('keydown', (event) => {
    keys.set(event.code, true);
})
document.body.addEventListener('keyup', (event) => {
    keys.set(event.code, false);
})
canvas.addEventListener('mousedown', (event) => {
    keys.set("" + event.button, true);
})
canvas.addEventListener('mouseup', (event) => {
    keys.set("" + event.button, false);
})
canvas.addEventListener('mousemove', (event) => {
    mx = event.clientX;
    my = event.clientY;
})