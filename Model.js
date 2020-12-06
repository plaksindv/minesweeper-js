let gameField = document.getElementById("gameField");
let infoField = document.getElementById("gameInfo");
let gameButton = document.getElementById('gameButton');

let db;
let cells;
let bombsArray;
let openCount;
let lostGame;
let wonGame;
let flagCount;
let bombs;
let turnNumber;
let currentId;

import { redrawCell, drawField, changeGameButtonPicture, drawNumberInCell, deleteFlag, drawGamesInfoTable, drawConcreteGameTable } from './View.js';

let contains = (array, element) => {
    for (let i of array) {
        if (i === element) {
            return true;
        }
    }
    return false;
}

let randomBombs = (n, bombsCount, position) => {
	let x, y;
	for (let i = position; i < bombsCount; i++) {
		x = Math.floor(Math.random() * n);
		y = Math.floor(Math.random() * n);
		let concreteBomb = x.toString() + "_" + y.toString();
		if (!contains(bombsArray, concreteBomb)) {
            bombsArray.push(concreteBomb);
        } else {
			randomBombs(n, bombsCount, i);
			break;
		}
	}
	if (bombsArray.length === bombsCount) {
        return;
    }
}

let setNearbyCount = (bombCoordinateX, bombCoordinateY) => {
    for (let i = bombCoordinateX - 1; i <= bombCoordinateX + 1; i++) {
        for (let j = bombCoordinateY - 1; j <= bombCoordinateY + 1; j++) {
            if (typeof cells[j] != "undefined" && typeof cells[j][i] != "undefined") {
                cells[j][i]['nearbycount'] +=1;
            }
        }
    }
}

let deployBombs = (bombsCount) => {
	for (let i = 0; i < bombsCount; i++){
		let coordinates = bombsArray[i].split("_");
        let x = coordinates[0];
        let y = coordinates[1];
		cells[parseInt(y)][parseInt(x)]['isbomb'] = 1;
		setNearbyCount(parseInt(x), parseInt(y));
	}
}

export let createGameField = (n, bombsCount, username) => {
    if (lostGame === 1)
        changeGameButtonPicture(gameButton, 'lost');

    if (wonGame === 1)
        changeGameButtonPicture(gameButton, 'won');

    openCount = 0;
    lostGame = 0;
    wonGame = 0;
    flagCount = 0;
    turnNumber = 0;
    bombs = bombsCount;
    
	cells = [];
    bombsArray = [];
    
	for (let i = 0; i < n; i++) {
	 	let concreteCell = [];
	 	for (let j = 0; j < n; j++) {
            concreteCell.push({'opened': 0, 'isbomb': 0, 'nearbycount': 0, 'marked': 0});
 		}
        cells.push(concreteCell);
    }


    drawField(gameField, n);
    randomBombs(n, bombsCount, 0);
    deployBombs(bombsCount);
    writeGameInfo(username, n, bombsCount);
    getCurrentId();
}

export let setFlag = (cell, replayMode) => {
    let x = cell.cellIndex;
    let y = cell.parentNode.rowIndex;

	if (cells[x][y]['marked'] === 0) {
        if (flagCount === bombs) {
            return;
        }
		if (cells[x][y]['opened'] === 0) {
			cells[x][y]['marked'] = 1;
            cells[x][y]['opened'] = 1;
            turnNumber++;
            flagCount++;
            openCount++;
            writeTurnInfo(currentId, 'Поставлен флаг', turnNumber, x, y, replayMode);
            redrawCell(cell, 'flag');
		}
	} else {
		if (cells[x][y]['opened'] != 0) {
			cells[x][y]['marked'] = 0;
            cells[x][y]['opened'] = 0;
            turnNumber++;
            flagCount--;
            openCount--;
            writeTurnInfo(currentId, 'Убран флаг', turnNumber, x, y, replayMode);
            deleteFlag(cell);
		}
    }

    if (openCount === cells.length * cells[0].length) {
        makeChangesForWonGame(replayMode);
    }
}

let openSurroundedCells = (x, y) => {
    for (let i = x - 1; i <= x + 1; i++) {
        for (let j = y - 1; j <= y + 1; j++) {
            if (typeof cells[i] != "undefined" && typeof cells[i][j] != "undefined") {
                let cell = gameField.rows[j].cells[i];
                openArea(cell);
            }
        }
    }        
}

let openArea = (cell) => {
    let x = cell.cellIndex;
    let y = cell.parentNode.rowIndex;
	if (cells[x][y]['opened'] === 0 && cells[x][y]['marked'] === 0) {
		cells[x][y]['opened'] = 1;
        openCount++;
        
		if (cells[x][y]['nearbycount'] != 0){
			drawNumberInCell(cell, cells[x][y]['nearbycount']);
			return;
        } else {
        redrawCell(cell, 'empty');
        }
		
        openSurroundedCells(x, y);

    } else {
        return;
    }
}

let makeChangesForLostGame = (cell, replayMode) => {
    lostGame = 1;
    updateGameStatus('gamesInfo', 'gameId', currentId, 'Игра проиграна', replayMode);
    for (let i = 0; i < bombsArray.length; i++) {
        let coordinates = bombsArray[i].split("_");
        let x = coordinates[0];
        let y = coordinates[1];
        let bombCell = gameField.rows[x].cells[y];

        if (cells[y][x]['marked'] != 1) {
            redrawCell(bombCell, 'bomb');
        } else {
            redrawCell(bombCell, 'defused');
        }

    }
    redrawCell(gameButton, 'lost');
    redrawCell(cell, 'boom');
}

let makeChangesForWonGame = (replayMode) => {
    wonGame = 1;
    updateGameStatus('gamesInfo', 'gameId', currentId, 'Игра выиграна', replayMode);
    updateGameStatus('turnsInfo', 'turnNumber', turnNumber, 'Игра выиграна', replayMode);
    for (let i = 0; i < bombsArray.length; i++) {
        let coordinates = bombsArray[i].split("_");
        let x = coordinates[0];
        let y = coordinates[1];
        let bombCell = gameField.rows[x].cells[y];
        redrawCell(bombCell, 'defused');
    }
    redrawCell(gameButton, 'won');
}

export let openCell = (cell, replayMode) => {
	if (lostGame || wonGame) {
        return;
    } else {
        let x = cell.cellIndex;
        let y = cell.parentNode.rowIndex;
        turnNumber++;

		if(cells[x][y]['opened'] != 1) {
			if(cells[x][y]['isbomb'] === 1) {
                writeTurnInfo(currentId, 'Игра проиграна', turnNumber, x, y, replayMode);
                makeChangesForLostGame(cell, replayMode);
			}
			else {
                writeTurnInfo(currentId, 'Открыта область', turnNumber, x, y, replayMode);
                openArea(cell);
            }
        }

		if (openCount === cells.length * cells[0].length) {
            makeChangesForWonGame(replayMode);
        }
	}
}

export async function initializeDatabase()
{
    db = await idb.openDB('gamesDb', 1, { upgrade(db) {
        db.createObjectStore('gamesInfo', {keyPath: 'gameId', autoIncrement: true});
        db.createObjectStore('turnsInfo', {keyPath: 'id', autoIncrement: true});
    },
    }); 
}

export async function getGames()
{
    let gamesList = await db.getAll('gamesInfo');
    drawGamesInfoTable(infoField, gamesList);
}

async function writeGameInfo(username, dimension, bombsCount)
{
    let date = new Date().toLocaleString();
    let gameStatus = 'Не окончена';
    try {
        await db.add('gamesInfo', {username, date, dimension, bombsCount, bombsArray, gameStatus});
    } catch(err) {
        throw err;
    }
}

async function updateGameStatus(storageName, key, concreteKey, gameStatus, replayMode)
{
    if (replayMode) {
        return;
    }

    let cursor = await db.transaction(storageName, 'readwrite').store.openCursor();

    while (cursor) {
        if (cursor.value[key] === concreteKey) {
            let updateData = cursor.value;
            updateData.gameStatus = gameStatus;
            cursor.update(updateData);
        }
        cursor = await cursor.continue();
    }    
}

async function getCurrentId()
{
    let gamesList = await db.getAll('gamesInfo');
    currentId = gamesList.length;
}

async function writeTurnInfo(gameId, gameStatus, turnNumber, x, y, replayMode)
{
    if (replayMode) {
        return;
    }
    let coordinates = x.toString() + "," + y.toString();
    try {
        await db.add('turnsInfo', {gameId, turnNumber, coordinates, gameStatus});
    } catch(err) {
        throw err;
    }
}

export async function startReplay(gameId) {
    if (lostGame === 1)
        changeGameButtonPicture(gameButton, 'lost');

    if (wonGame === 1)
        changeGameButtonPicture(gameButton, 'won');

    let dimension;
    let bombsCount;
    let cursor = await db.transaction('gamesInfo', 'readonly').store.openCursor();

    while (cursor) {
        if (cursor.value.gameId === gameId) {
            dimension = cursor.value.dimension;
            bombsCount = cursor.value.bombsCount;
            break;
        }
        cursor = await cursor.continue();
    }

    bombsArray = cursor.value.bombsArray;

    openCount = 0;
	lostGame = 0;
    wonGame = 0;
    flagCount = 0;
    turnNumber = 0;
    bombs = bombsCount;
    getCurrentId();

	cells = [];
    
	for (let i = 0; i < dimension; i++) {
	 	let concreteCell = [];
	 	for (let j = 0; j < dimension; j++) {
            concreteCell.push({'opened': 0, 'isbomb': 0, 'nearbycount': 0, 'marked': 0});
 		}
        cells.push(concreteCell);
    }

    drawField(gameField, dimension);
    deployBombs(bombsCount);
    createReplay(gameId);
}

async function createReplay(gameId)
{
    let cursor = await db.transaction('turnsInfo', 'readonly').store.openCursor();

    let concreteGameTurns = [];
    let indexForArray = 0;

    while (cursor) {
        if (cursor.value.gameId === gameId) {
            concreteGameTurns[indexForArray] = cursor.value;
            indexForArray++;
        }
        cursor = await cursor.continue();
    }

    for (let i = 0; i < concreteGameTurns.length; i++) {
        let coordinatesArray = concreteGameTurns[i]['coordinates'].split(',');
        let y = coordinatesArray[0];
        let x = coordinatesArray[1];
        let cell = gameField.rows[x].cells[y];
        
        
        if (concreteGameTurns[i]['gameStatus'] === 'Поставлен флаг' || concreteGameTurns[i]['gameStatus'] === 'Убран флаг'){
            setTimeout(setFlag, (i + 1) * 1000, cell, true);
        }
        else {
            if (contains(bombsArray, x + "_" + y) && concreteGameTurns[i]['gameStatus'] === 'Игра выиграна') {
                setTimeout(setFlag, (i + 1) * 1000, cell, true);
            } else {
                setTimeout(openCell, (i + 1) * 1000, cell, true);
            }
        }
    }

    drawConcreteGameTable(infoField, concreteGameTurns, gameId);
}
