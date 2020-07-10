function newPlayer() {
    var movementAbility = "Grapple";
    if (character == "engineer") {
        movementAbility = "Jetpack";
    }
    if (character == "fighter") {
        movementAbility = "Skates";
    }
    var thisPlayer = {
        uniqueID: localUsername,
        type: "player",
        xpos: 0,
        ypos: 0,
        xvel: 0,
        yvel: 0,
        class: character,
        inventory: {
            primary: "",
            secondary: "",
            movement: movementAbility
        },
        worldinfluence: {}
    }

    return thisPlayer;
}