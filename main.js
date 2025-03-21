//    Variables
var disabled = false;
var moves = 0;
var wins = 0;
var losses = 0;
var player = "";
var encoded_binary = "";
var decoded = {};

const CHARS = {
    "0": "0000000",
    "1": "0000001",
    "2": "0000010",
    "3": "0000011",
    "4": "0000100",
    "5": "0000101",
    "6": "0000110",
    "7": "0000111",
    "8": "0001000",
    "9": "0001001",
    "a": "0001010",
    "b": "0001011",
    "c": "0001100",
    "d": "0001101",
    "e": "0001110",
    "f": "0001111",
    "g": "0010000",
    "h": "0010001",
    "i": "0010010",
    "j": "0010011",
    "k": "0010100",
    "l": "0010101",
    "m": "0010110",
    "n": "0010111",
    "o": "0011000",
    "p": "0011001",
    "q": "0011010",
    "r": "0011011",
    "s": "0011100",
    "t": "0011101",
    "u": "0011110",
    "v": "0011111",
    "w": "0100000",
    "x": "0100001",
    "y": "0100010",
    "z": "0100011",
    "A": "0100100",
    "B": "0100101",
    "C": "0100110",
    "D": "0100111",
    "E": "0101000",
    "F": "0101001",
    "G": "0101010",
    "H": "0101011",
    "I": "0101100",
    "J": "0101101",
    "K": "0101110",
    "L": "0101111",
    "M": "0110000",
    "N": "0110001",
    "O": "0110010",
    "P": "0110011",
    "Q": "0110100",
    "R": "0110101",
    "S": "0110110",
    "T": "0110111",
    "U": "0111000",
    "V": "0111001",
    "W": "0111010",
    "X": "0111011",
    "Y": "0111100",
    "Z": "0111101",
    " ": "0111110",
    ".": "0111111",
    ",": "1000000"
};

const about = {
    series: "o", //old
    game: "g1", //game 1 lights out
    version: "v.2.1" //version v.2.1
};

//    Functions
document.addEventListener("DOMContentLoaded", function () {
    //    Styles
    const star_container = document.getElementById("stars-container");

    function createStar() {
        const star = document.createElement("div");
        star.classList.add("shooting-stars");

        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight * 0.5;
        star.style.left = `${startX}px`;
        star.style.top = `${startY}px`;

        star.style.animation = `shootingStar ${Math.random() * 2 + 1}s linear infinite`;

        star_container.appendChild(star);

        setTimeout(() => star.remove(), 3000);

        document.addEventListener('scroll', () => {
            let scroll_pos = window.scrollY;
            if (star) {
                var new_pos = (((scroll_pos * 0.9) - scroll_pos) + 185);
                star.style.top = `${new_pos}px`
            }
        });
    }

    setInterval(createStar, 500);

    const starCount = 100;
    const stillStarContainer = document.getElementById("still-stars-container");
    let stars = [];

    for (let i = 0; i < starCount; i++) {
        let star = document.createElement("div");
        star.classList.add("still-star");

        let xPos = Math.random() * window.innerWidth;
        let yPos = Math.random() * window.innerHeight;

        star.style.left = `${xPos}px`;
        star.style.top = `${yPos}px`;

        let size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        star.style.opacity = Math.random() * 0.5 + 0.5;

        let delay = Math.random() * 2;
        star.style.animationDelay = `${delay}s`;

        let speed = Math.random() * 0.5 + 0.2;
        speed = (speed * 0.9) - speed;
        star.dataset.speed = speed;

        stars.push(star);
        stillStarContainer.appendChild(star);
    }

    window.addEventListener("scroll", () => {
        let scrollY = window.scrollY;
        stars.forEach(star => {
            let speed = parseFloat(star.dataset.speed);
            star.style.transform = `translateY(${scrollY * speed}px)`;
        });
    });

    document.addEventListener("scroll", () => {
        let scroll_pos = window.scrollY;
        const moon = document.querySelector("#moon");
        var new_pos = (((scroll_pos * 0.9) - scroll_pos) + 185);

        if (moon) {
            moon.style.top = `${new_pos}px`;
        }
    });
});

//    Setup
document.addEventListener("DOMContentLoaded", () => {
    let temp_player = window.localStorage.getItem("player");
    if (!temp_player) {
        player = "";
    } else {
        document.getElementById("player-name").value = temp_player;
        player = temp_player;
    }

    randomize();
    updateMoves();
    update();

    document.getElementById("gamepad").addEventListener("click", function (event) {
        if (!disabled) {
            if (event.target.classList.contains("cell")) {
                toggle(event.target);
                updateMoves("update");
                checkWin();
                if (!disabled) {
                    checkLose();
                }
                update();
            }
        }
    });

    window.addEventListener("keydown", e => {
        if (e.altKey && e.code === "KeyT") {
            dev();
        }
    });

    document.getElementById("encoded").addEventListener("click", () => {
        navigator.clipboard.writeText(encoded_binary);
        window.alert("Copied to clipboard");
    });
});
//   Mechanics

function toggle(ele) {
    let x = parseInt(ele.getAttribute("data-x"));
    let y = parseInt(ele.getAttribute("data-y"));

    let neighbors = [
        { x: x + 1, y: y },
        { x: x - 1, y: y },
        { x: x, y: y + 1 },
        { x: x, y: y - 1 }
    ];

    ele.classList.toggle("on");

    neighbors.forEach(n => {
        let neighborCell = document.querySelector(`.cell[data-x='${n.x}'][data-y='${n.y}']`);
        if (neighborCell) {
            neighborCell.classList.toggle("on");
        }
    });
}

function randomize() {
    for (i = 0; i < 11; i++) {
        let numX = Math.floor(Math.random() * 3);
        let numY = Math.floor(Math.random() * 3);

        const element = document.querySelector(`.cell[data-x='${numX}'][data-y='${numY}']`);

        if (element) {
            toggle(element);
        }
    }
}

function clear() {
    document.querySelectorAll(".cell").forEach(cell => {
        cell.classList.remove("on");
    });
}

function reset() {
    clear();
    randomize();
    disable(true);
    moves = 0;
    updateMoves();
    document.getElementById("status").innerHTML = "Playing";
}

function disable(reverse) {
    if (reverse) {
        disabled = false;
    } else {
        disabled = true;
    }
}

//    check
function checkWin() {
    let cells = document.querySelectorAll(".cell");
    let onCells = Array.from(cells).filter(cell => cell.classList.contains("on"));

    if (onCells.length === 0) {
        wins += 1;
        document.getElementById("status").innerHTML = "You win!";
        disable(false);
        setTimeout(() => {
            reset();
        }, 2000);
    }
}

function checkLose() {
    let cells = document.querySelectorAll(".cell");
    let onCells = Array.from(cells).filter(cell => cell.classList.contains("on"));

    if (onCells.length === 9) {
        losses += 1;
        document.getElementById("status").innerHTML = "You lose!";
        disable(false);
        setTimeout(() => {
            reset();
        }, 2000);
    }
}

//    update
function update() {
    document.getElementById("wins").innerHTML = wins;
    document.getElementById("losses").innerHTML = losses;
    encode();
    document.getElementById("encoded").innerHTML = encoded_binary;
}

function updateMoves(action = "none") {
    const ele = document.getElementById("moves");
    if (action === "update") {
        moves++;
    }
    ele.innerHTML = moves;
}

function updateDecoded() {
    document.getElementById("player-name").value = decoded.name;
    document.getElementById("wins").innerHTML = decoded.wins;
    document.getElementById("losses").innerHTML = decoded.losses;
    player = decoded.name;
    wins = decoded.wins;
    losses = decoded.losses;
    window.localStorage.setItem("player", player);
}

//    name
function rename() {
    player = document.getElementById("player-name").value;
    window.localStorage.setItem("player", player);
    update();
}

//    encode
function encodeName(name) {
    let encoded = "";
    for (let i = 0; i < name.length; i++) {
        encoded += CHARS[name[i]] + " ";
    }
    encoded = "n(" + encoded.trim().split(" ").join(",") + ")";
    return encoded;
}

function encodeWins() {
    let encoded = "";
    let wins_str = wins.toString();
    for (let i = 0; i < wins_str.length; i++) {
        encoded += CHARS[wins_str[i]] + " ";
    }
    encoded = "w(" + encoded.trim().split(" ").join(",") + ")";
    return encoded;
}

function encodeLosses() {
    let encoded = "";
    let losses_str = losses.toString();
    for (let i = 0; i < losses_str.length; i++) {
        encoded += CHARS[losses_str[i]] + " ";
    }
    encoded = "l(" + encoded.trim().split(" ").join(",") + ")";
    return encoded;
}

function encode() {
    if (player === "") {
        window.alert("Please enter your name");
    }
    encoded_binary = about.series + " " + about.game + " " + about.version + " " + encodeName(player) + " " + encodeWins() + " " + encodeLosses();
}

//    decode
function decode() {
    let encoded = document.getElementById("string").value;
    let decoded_name = "";
    let decoded_wins = 0;
    let decoded_losses = 0;

    if (!encoded) {
        window.alert("Please enter a binary string");
        return;
    }

    let parts = encoded.split(" ");
    console.log(parts);

    if (parts.length !== 6) {
        window.alert("Sorry, the binary string is invalid");
        return;
    }

    //    Checking if the string belongs to this game
    if (parts[0] !== about.series) {
        window.alert("The binary string does not belong to this series");
        return;
    }

    if (parts[1] !== about.game) {
        window.alert("The binary string does not belong to this game");
        return;
    }

    if (parts[2] !== about.version) {
        window.alert("The binary string does not belong to this version. We are upgrading your binary string to the latest version");
        parts[2] = about.version;
    }

    //    Decoding name
    if (!parts[3].includes("n(") || !parts[3].includes(")")) {
        window.alert("Sorry, the binary string is corrupted");
    }

    let temp_decoded_name = parts[3].replace("n(", "").replace(")", "");
    let name_arr = temp_decoded_name.split(",");
    console.log(name_arr);
    for (let i = 0; i < name_arr.length; i++) {
        for (const [key, value] of Object.entries(CHARS)) {
            if (CHARS[key] === name_arr[i]) {
                decoded_name += key;
            }
        }
    }

    //    Decoding wins
    if (!parts[4].includes("w(") || !parts[4].includes(")")) {
        window.alert("Sorry, the binary string is corrupted");
    }

    let temp_decoded_wins = parts[4].replace("w(", "").replace(")", "");
    let wins_arr = temp_decoded_wins.split(",");
    for (let i = 0; i < wins_arr.length; i++) {
        for (const [key, value] of Object.entries(CHARS)) {
            if (CHARS[key] === wins_arr[i]) {
                decoded_wins += key;
            }
        }
    }

    //    Decoding losses
    if (!parts[5].includes("l(") || !parts[5].includes(")")) {
        window.alert("Sorry, the binary string is corrupted");
    }

    let temp_decoded_losses = parts[5].replace("l(", "").replace(")", "");
    let losses_arr = temp_decoded_losses.split(",");
    for (let i = 0; i < losses_arr.length; i++) {
        for (const [key, value] of Object.entries(CHARS)) {
            if (CHARS[key] === losses_arr[i]) {
                decoded_losses += key;
            }
        }
    }

    decoded = {
        "name": decoded_name,
        "wins": parseInt(decoded_wins),
        "losses": parseInt(decoded_losses)
    };

    if (!decoded) {
        window.alert("Sorry, the decoded data is invalid, please retry.");
        return;
    }

    console.log(decoded);
    updateDecoded();
}

//    Save/Load
function save() {
    window.localStorage.setItem("o.g1.encoded_binary", encoded_binary);
    window.alert("Saved!");
}

function load() {
    let temp_encoded_binary = window.localStorage.getItem("o.g1.encoded_binary");
    if (!temp_encoded_binary) {
        window.alert("No saved data found");
    } else {
        document.getElementById("string").value = temp_encoded_binary;
        decode();
    }
}

//    devloper tools
function dev() {
    let op_code = window.prompt("Developer tools: Enter command");

    if (op_code === "") {
        return;
    } else if (op_code === "/forcewin") {
        clear();
        checkWin();
        return;
    } else if (op_code === "/on") {
        let x = window.prompt("Developer tools: Enter X coordinate");
        let y = window.prompt("Developer tools: Enter Y coordinate");

        document.querySelector(`.cell[data-x='${x}'][data-y='${y}']`)?.classList.add("on");
    } else if (op_code === "/off") {
        let x = window.prompt("Developer tools: Enter X coordinate");
        let y = window.prompt("Developer tools: Enter Y coordinate");

        document.querySelector(`.cell[data-x='${x}'][data-y='${y}']`)?.classList.remove("on");
    } else if (op_code === "/forcelose") {
        document.querySelectorAll(".cell").forEach(cell => {
            cell.classList.add("on");
        });
        checkLose();
        return;
    }

    checkWin();
    if (!disabled) {
        checkLose();
    }
    update();
}
