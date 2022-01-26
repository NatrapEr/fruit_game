let game = {};
let panel = 'start';
let name = ' ';
let $ = function (domElement) {
    return document.querySelector(domElement);
}

let nav = () => {
    document.onclick = (ev) => {
        ev.preventDefault();
        switch (ev.path[0].id) {
            case "startGame":
                go('game', 'd-block');
                break;
            case "restart":
                go('game', 'd-block');
                for(let child of $('.elements').querySelectorAll('.element')) {
                    child.remove();
                }
                break;
        }
    }
}
let go = (page, attribute) => {
    let pages = ['start', 'game', 'end'];
    panel = page;
    $(`#${panel}`).setAttribute('class', attribute);
    pages.forEach(e => {
        if(panel !== e) $(`#${e}`).setAttribute('class', 'd-none')
    })
}
let startLoop = () => {
    let inter = setInterval(() => {
        if(panel !== "start") clearInterval(inter);
        checkName();
    }, 100);
}

let checkName = () => {
    name = $('#nameInput').value.trim();
    if(name !== '') {
        localStorage.setItem('userName', name);
        $('#startGame').removeAttribute('disabled');
    } else {
        $('#startGame').setAttribute('disabled', 'disabled');
    }
}

let checkStorage = () => {
    $('#nameInput').value = localStorage.getItem('userName') || '';
}

let random = (min, max) => {
    min = Math.ceil(min);
    max = Math.ceil(max);
    return Math.floor(Math.random()*(max - min + 1) + min);
}

window.onload = () => {
    nav()
    startLoop();
    checkStorage();
    setInterval(() => {
        if(panel=== "game") {
            game = new Game();
            game.start();
            panel = "game process";
        }
    }, 500);
}