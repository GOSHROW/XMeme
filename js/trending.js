/*  makes the GET /memes API call to backend and returns JSON
*/
const backendURL = "http://localhost:3000/";

async function get100memes() {
    let url = backendURL + "memes/trendy";
    let ret =  await fetch(url)
    .then(data => {
        return data.json()
    })
    .then(res => {
        return res;
    })
    .catch(err => {
        console.error(err);
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
    // console.log(memeArray);
    for (var index = 0; index < memeArray.length; index++) {
        appendMeme(memeArray[index]);
    }
}

main();