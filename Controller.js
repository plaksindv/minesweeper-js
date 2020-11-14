import { createGameField, openCell, setFlag } from './Model.js';

let gameField = document.getElementById("gameField");
let gameButton = document.getElementById("button");

const DIMENSION = 10;
const BOMBS_COUNT = 10;

window.onload = () => {
	createGameField(DIMENSION, BOMBS_COUNT);
};

gameButton.onclick = (event) => {
    createGameField(DIMENSION, BOMBS_COUNT);
}

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
