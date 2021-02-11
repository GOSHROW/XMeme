function checkURL (url) {
    var string = url.value;
    if (!~string.indexOf("http")) {
      string = "http://" + string;
    }
    url.value = string;
    return url
}

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
    
    xhr.open('POST', 'http://localhost:3000/memes');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(data);
}