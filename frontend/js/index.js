function addHTTP (url) {
    var string = url.value;
    if (!~string.indexOf("http")) {
      string = "http://" + string;
    }
    url.value = string;
    return url;
}

const backend = "http://localhost:3000/"

function postMeme() {
    const name = document.getElementById("name").value;
    const caption = document.getElementById("caption").value;
    const url = document.getElementById("url").value;

    const data = JSON.stringify({
        name: name,
        caption: caption,
        url: url
    });
    const xhr = new XMLHttpRequest()
    xhr.addEventListener('readystatechange', function() {
        if (this.readyState === this.DONE) {
            console.log(this.responseText)
        }
    });
    xhr.open('POST', backend + 'memes');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(data);

    setLatest();
}

async function setLatest() {
    resJSON  = await fetch(backend + "memes/newest/1")
        .then(res => res.json())
        .then(ret => {return ret[0];})
        .catch(err => console.error(err))
    document.getElementById("curr-caption").innerHTML = resJSON["caption"]
    document.getElementById("curr-name").innerHTML = resJSON["name"]
    document.getElementById("meme-img").src = resJSON["url"]
    document.getElementById("curr-id").innerHTML = resJSON["id"]
    document.getElementById("curr-time").innerHTML = resJSON["modified"]
    document.getElementById("curr-likes-cntr").innerHTML = resJSON["likes"]
}

async function getPrevious() {
    var currid = document.getElementById("curr-id").innerHTML;
    resJSON  = await fetch(backend + "memes/prev/" + currid)
        .then(res => res.json())
        .then(ret => {return ret;})
        .catch(err => console.error(err));
    document.getElementById("curr-caption").innerHTML = resJSON["caption"]
    document.getElementById("curr-name").innerHTML = resJSON["name"]
    document.getElementById("meme-img").src = resJSON["url"]
    document.getElementById("curr-id").innerHTML = resJSON["id"]
    document.getElementById("curr-time").innerHTML = resJSON["modified"]
    document.getElementById("curr-likes-cntr").innerHTML = resJSON["likes"]
}

async function getNext() {
    var currid = document.getElementById("curr-id").innerHTML;
    resJSON  = await fetch(backend + "memes/next/" + currid)
        .then(res => res.json())
        .then(ret => {return ret;})
        .catch(err => console.error(err))
    document.getElementById("curr-caption").innerHTML = resJSON["caption"]
    document.getElementById("curr-name").innerHTML = resJSON["name"]
    document.getElementById("meme-img").src = resJSON["url"]
    document.getElementById("curr-id").innerHTML = resJSON["id"]
    document.getElementById("curr-time").innerHTML = resJSON["modified"]
    document.getElementById("curr-likes-cntr").innerHTML = resJSON["likes"]
}

setLatest();