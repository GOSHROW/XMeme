/*  makes the GET /trends API call to backend and returns JSON
*/
const backendURL = "http://localhost:8081/";

async function get100memes() {
    let url = backendURL + "trends";
    let ret =  await fetch(url)
    .then(data => {
        return data.json()
    })
    .then(res => {
        return res;
    })
    .catch(err => {
        // console.error(err);
    });
    return ret;
}

function appendMeme(memeJSON) {
    var toAppend = document.getElementById("memes-section")
    toAppend.innerHTML += 
    `<div class="meme-card">
        <blockquote class="meme-caption">
            ${memeJSON.caption}
            <cite class="meme-name">
                ${memeJSON.name}
            </cite>
        </blockquote>
        <br/>
        <img class="meme-img" alt="Current Meme Image" src="${memeJSON.url}" alt="Meme at ${memeJSON.id}" 
        onerror="this.src='assets/meme404.jpg'">
    </div>
    `
}

async function main() {
    let memeArray = await get100memes()
    .then(memesJSON => {
        return memesJSON;
    });
    // console.log(memeArray);
    for (var index = 0; index < memeArray.length; index++) {
        appendMeme(memeArray[index]);
    }
}

main();