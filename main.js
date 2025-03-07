//    Variables
var disabled = false;
moves = 0;

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

    randomize();
    updateMoves();

    document.getElementById("gamepad").addEventListener("click", function (event) {
        if (!disabled) {
            if (event.target.classList.contains("cell")) {
                toggle(event.target);
                updateMoves("update");
                checkWin();
                if (!disabled) {
                    checkLose();
                }
            }
        }
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

function checkWin() {
    let cells = document.querySelectorAll(".cell");
    let onCells = Array.from(cells).filter(cell => cell.classList.contains("on"));

    if (onCells.length === 0) {
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
        document.getElementById("status").innerHTML = "You lose!";
        disable(false);
        setTimeout(() => {
            reset();
        }, 2000);
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

function updateMoves(action = "none") {
    const ele = document.getElementById("moves");
    if (action === "update") {
        moves++;
    }
    ele.innerHTML = moves;
}

function disable(reverse) {
    if (reverse) {
        disabled = false;
    } else {
        disabled = true;
    }
}
