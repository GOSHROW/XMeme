/*  makes the GET /trends API call to backend and returns JSON
*/
const backendURL = "https://apixmeme.goshrow.tech/";

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
    var timeToAppend = beautifiedTime(memeJSON.modified)
    toAppend.innerHTML += 
    `<div class="meme-card">
        <blockquote class="meme-caption">
            ${memeJSON.caption}
            <cite class="meme-name">
                ${memeJSON.name}
                &nbsp; &nbsp;trended
                ${timeToAppend}
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

/*  Provides human readable date formats for iso8061 timestamps
*/
function beautifiedTime(iso8061) {
    var timestamp = new Date(iso8061);
    var now = new Date();
    var units = {
        year  : 24 * 60 * 60 * 1000 * 365,
        month : 24 * 60 * 60 * 1000 * 365/12,
        day   : 24 * 60 * 60 * 1000,
        hour  : 60 * 60 * 1000,
        minute: 60 * 1000,
        second: 1000
    }
    var rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    var getRelativeTime = (d1, d2 = new Date()) => {
        var elapsed = d1 - d2
        
        for (var u in units) 
            if (Math.abs(elapsed) > units[u] || u == 'second') 
                return rtf.format(Math.round(elapsed/units[u]), u)
    }
    return getRelativeTime(now, timestamp);
}