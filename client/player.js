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
        health: 100,
        xpos: 250,
        ypos: 250,
        xvel: 0,
        yvel: 0,
        class: character,
        inventory: {
            primary: "",
            secondary: "",
            movement: movementAbility,
            burntimes: [100, 100, 100],
            items: []
        },
        cooldowns: [0, 0, 0],
        maxcooldowns: getMaxCooldowns(character),
        animations: {
            name: "",
            current: 0,
            max: 0,
            loop: true,
        },
        worldinfluence: {}
    }

    return thisPlayer;
}

function getMaxCooldowns(char) {
    if (char == "chef") {
        return [100, 100, 100]
    } else if (char == "fighter") {
        return [25, 2, 100]
    } else {
        return [100, 100, 100]
    }
}