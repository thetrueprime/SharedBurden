function newPlayer() {

    var thisPlayer = {
        uniqueID: localUsername,
        type: "player",
        xpos: 0,
        ypos: 0,
        xvel: 0,
        yvel: 0,
        inventory: {
            primary: "",
            secondary: "",
            movement: "Grapple"
        }
    }

    return thisPlayer;
}