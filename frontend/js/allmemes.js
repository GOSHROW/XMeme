/*  makes the GET /memes API call to backend and returns JSON
*/
const backendURL = "http://localhost:3000/";

async function get100memes() {
    let url = backendURL + "memes";
    let ret =  await fetch(url)
    .then(data => {
        return data.json()
    })
    .then(res => {
        return res;
    });
    return ret;
}

function appendMeme(memeJSON) {
    var toAppend = document.getElementById("memes-section")
    toAppend.innerHTML += 
    `<div class="meme-card">
        <div class="meme-name">
            ${memeJSON.name}
        </div>
        <div class="meme-caption">
            ${memeJSON.caption}
        </div>
        <img class="meme-img" src="${memeJSON.url}" alt="Meme at ${memeJSON.id}" 
        onerror="this.src='assets/meme404.jpg'">
    </div>
    `
}

async function main() {
    let memeArray = await get100memes()
    .then(memesJSON => {
        return memesJSON;
    });
    for (var index = 0; index < memeArray.length; index++) {
        appendMeme(memeArray[index]);
    }
}

main();