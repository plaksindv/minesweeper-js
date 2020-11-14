export let redrawCell = (element, picture) => {
    element.classList.add(picture);
}

export let drawField = (element, n) => {
    let html = "";
    for(let i = 0; i < n; i++){
        html += "<tr>";
        for(let j = 0; j < n; j++){
            html += "<td class = 'cell'></td>";
        }
    }
    element.innerHTML = html;
}

export let changeGameButtonPicture = (element, picture) => {
    element.classList.remove(picture);
}
