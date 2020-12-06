import { createGameField, openCell, setFlag, initializeDatabase, getGames, startReplay } from './Model.js';

let gameField = document.getElementById("gameField");
let gameButton = document.getElementById("gameButton");
let startButton = document.getElementById("startGame");
let gamesButton = document.getElementById("showGames");
let replayButton = document.getElementById("showReplay");

let dimension = 0;
let bombsCount = 0;

let startGame = () => {
    let username;
    while (username === undefined || username === null) {
        username = prompt("Введите имя игрока");
    }
    while (dimension === 0 && bombsCount === 0) {
        dimension = +prompt("Введите размерность поля");
        bombsCount = +prompt("Введите количество бомб");
                
        if (bombsCount > dimension * dimension) {
            bombsCount = +prompt("Неверно указано количество бомб! Введите еще раз");
        }
    }

    createGameField(dimension, bombsCount, username);
    
    dimension = 0;
    bombsCount = 0;
}

let getReplay = () => {
    let gameId;
    gameId = +prompt("Введите id игры");
    startReplay(gameId);
}

window.onload = initializeDatabase;

startButton.onclick = startGame;
gameButton.onclick = startGame;
gamesButton.onclick = getGames;
replayButton.onclick = getReplay;


gameField.onclick = (event) => {
    let td = event.target;

    if (td.tagName != 'TD') return;

    openCell(td, false);
}

gameField.oncontextmenu = (event) => {
    let td = event.target;

    if (td.tagName != 'TD') return;

    setFlag(td, false);
    return false;
}
