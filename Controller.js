import { createGameField, openCell, setFlag } from './Model.js';

let gameField = document.getElementById("gameField");
let gameButton = document.getElementById("button");

let dimension = 0;
let bombsCount = 0;

let startGame = () => {
    while (dimension === 0 && bombsCount === 0) {
        dimension = prompt("Введите размерность поля");
        bombsCount = prompt("Введите количество бомб");
                
        if (bombsCount > dimension * dimension) {
            bombsCount = prompt("Неверно указано количество бомб! Введите еще раз");
        }
    }

    createGameField(dimension, bombsCount);
    
    dimension = 0;
    bombsCount = 0;
}

window.onload = startGame;
gameButton.onclick = startGame;

gameField.onclick = (event) => {
    let td = event.target;

    if (td.tagName != 'TD') return;

    openCell(td);
}

gameField.oncontextmenu = (event) => {
    let td = event.target;

    if (td.tagName != 'TD') return;

    setFlag(td);
    return false;
}
