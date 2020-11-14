let gameField = document.getElementById("gameField");
let gameButton = document.getElementById('button');

let cells;
let bombsArray;
let openCount;
let lostGame;
let wonGame;
let flagCount;
let bombs;

import { redrawCell, drawField, changeGameButtonPicture } from './View.js';

let contains = (arr, elem) => {
    for (let i of arr) {
        if (i === elem) {
            return true;
        }
    }
    return false;
}

let randomBombs = (n, bombsCount, position) => {
	let id0, id1;
	for (let i = position; i < bombsCount; i++) {
		id0 = Math.floor(Math.random() * n);
		id1 = Math.floor(Math.random() * n);
		let temp = id0.toString() + "_" + id1.toString();
		if (!contains(bombsArray, temp)) {
            bombsArray.push(temp);
        } else {
			randomBombs(n, bombsCount, i);
			break;
		}
	}
	if (bombsArray.length === bombsCount) {
        return;
    }
}


let deployBombs = (bombsCount) => {
	for (let i = 0; i < bombsCount; i++){
		let ids = bombsArray[i].split("_");
		cells[parseInt(ids[1])][parseInt(ids[0])]['isbomb'] = 1;
		for (let j = parseInt(ids[0]) - 1; j <= parseInt(ids[0]) + 1; j++) {
			for (let k = parseInt(ids[1]) - 1; k <= parseInt(ids[1]) + 1; k++) {
				if (typeof cells[k] != "undefined" && typeof cells[k][j] != "undefined") {
                    cells[k][j]['nearbycount'] +=1;
                }
            }
        }
	}
}

export let createGameField = (n, bombsCount) => {
    if (lostGame === 1)
        changeGameButtonPicture(gameButton, 'lost');

    if (wonGame === 1)
        changeGameButtonPicture(gameButton, 'won');

    openCount = 0;
	lostGame = 0;
    wonGame = 0;
    flagCount = 0;
    bombs = bombsCount;

	cells = [];
    bombsArray = [];
    
	for (let i = 0; i < n; i++) {
	 	let temp = [];
	 	for (let j = 0; j < n; j++) {
            temp.push({'opened': 0, 'isbomb': 0, 'nearbycount': 0, 'marked': 0});
 		}
        cells.push(temp);
    }

    drawField(gameField, n);
	randomBombs(n, bombsCount, 0);
	deployBombs(bombsCount);
}

export let setFlag = (cell) => {
    let x = cell.cellIndex;
    let y = cell.parentNode.rowIndex;

	if (cells[x][y]['marked'] === 0) {
        if (flagCount === bombs) {
            return;
        }
		if (cells[x][y]['opened'] === 0) {
			cells[x][y]['marked'] = 1;
            cells[x][y]['opened'] = 1;
            flagCount++;
			openCount++;
			cell.classList.add('flag');
		}
	} else {
		if (cells[x][y]['opened'] != 0) {
			cells[x][y]['marked'] = 0;
			cells[x][y]['opened'] = 0;
            flagCount--;
            openCount--;
			cell.classList.remove('flag');
		}
    }
}


let openSurroundedCells = (i, j) => {
	if (typeof cells[i] != "undefined" && typeof cells[i][j] != "undefined") {
        let cell = gameField.rows[j].cells[i];
		openArea(cell);
	}
}


let openArea = (cell) => {
    let x = cell.cellIndex;
    let y = cell.parentNode.rowIndex;
	if (cells[x][y]['opened'] === 0 && cells[x][y]['marked'] === 0) {
		cells[x][y]['opened'] = 1;
		openCount++;
		if (cells[x][y]['nearbycount'] != 0){
			cell.innerHTML = cells[x][y]['nearbycount'].toString();
			cell.classList.add('number');
			return;
        } else {
        cell.classList.add('empty');
        }
		
        for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
                    openSurroundedCells(i, j);
            }
        }
    } else {
        return;
    }
}

let makeChangesForLostGame = (cell) => {
    lostGame = 1;
    for (let i = 0; i < bombsArray.length; i++) {
        let ids = bombsArray[i].split("_");
        let bombCell = gameField.rows[ids[0]].cells[ids[1]];
        if (cells[ids[1]][ids[0]]['marked'] != 1) {
            redrawCell(bombCell, 'bomb');
        } else {
            redrawCell(bombCell, 'defused');
        }
    }
    redrawCell(gameButton, 'lost');
    redrawCell(cell, 'boom');
}

let makeChangesForWonGame = () => {
    wonGame = 1;
    for (let i = 0; i < bombsArray.length; i++) {
        let ids = bombsArray[i].split("_");
        let bombCell = gameField.rows[ids[0]].cells[ids[1]];
        redrawCell(bombCell, 'defused');
    }
    redrawCell(gameButton, 'won');
}

export let openCell = (cell) => {
	if (lostGame || wonGame) {
        return;
    } else {
        let x = cell.cellIndex;
        let y = cell.parentNode.rowIndex;

		if(cells[x][y]['opened'] != 1) {
			if(cells[x][y]['isbomb'] === 1){
                makeChangesForLostGame(cell);
			}
			else {
				openArea(cell);
            }
        }

		if (openCount === cells.length * cells[0].length) {
            makeChangesForWonGame();
		}
	}
}