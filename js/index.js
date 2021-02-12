/*  Prepends HTTP to URL fields as a basic feature
*/

function addHTTP (url) {
    var string = url.value;
    if (!~string.indexOf("http")) {
      string = "http://" + string;
    }
    url.value = string;
    return url;
}

const backend = "http://localhost:8081/"

/*  Triggered by #post, makes a POST API call to initiate a new entry into DB
    Uses values in the form input fields.
*/
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
            // console.log(this.responseText)
        }
    });
    xhr.open('POST', backend + 'memes');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(data);

    setLatest();
}

/*  For given response JSON of the meme entry from DB, sets up the HTML elements
*/

function setJSONToHTML(resJSON) {
    document.getElementById("curr-caption").innerHTML = resJSON["caption"]
    document.getElementById("curr-name").innerHTML = resJSON["name"]
    document.getElementById("meme-img").src = resJSON["url"]
    document.getElementById("curr-id").innerHTML = resJSON["id"]
    document.getElementById("curr-time").innerHTML = beautifiedTime(resJSON["modified"])
    document.getElementById("curr-likes-cntr").innerHTML = resJSON["likes"]
    document.getElementById("curr-likes-btn").setAttribute("liked", (localStorage.getItem("like" + resJSON["id"]) == "1") ? "true" : "false");
}

/*  Makes the PATCH request to increment like for a given id
    Reads ID from HTML page #curr-id
*/
async function sendLike() {
    const currid = document.getElementById("curr-id").innerHTML.trim();
    var likeorigin = document.getElementById("curr-likes-btn");
    if (likeorigin.getAttribute("liked") == "true") {
        // console.log("ALREADY LIKED")
        return;
    } else {
        localStorage.setItem("like" + currid, "1");  
        likeorigin.liked = "true";
        resJSON  = await fetch(backend + "likes/" + currid, {
            method: "PATCH"
        }).then(res => res.json())
        .then(ret => {
            document.getElementById("curr-likes-btn").setAttribute("liked", (localStorage.getItem("like" + currid) == "1") ? "true" : "false");
            // console.log(currid + "liked" + localStorage.getItem("like" + currid));
            return ret;
        })
        .catch(
            // err => console.error(err)
        );
        document.getElementById("curr-likes-cntr").innerHTML = Number(document.getElementById("curr-likes-cntr").innerHTML) + 1;
    }
}

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

/* Get latest meme in case none have been provided yet
*/
async function setLatest() {
    resJSON  = await fetch(backend + "memes/newest/1")
        .then(res => res.json())
        .then(ret => {
            setJSONToHTML(ret[0]);
            return ret[0];
        })
        .catch(
            // err => console.error(err)
        );
}

/* Get previous meme from id extracted from the page's #curr-id
*/
async function getPrevious() {
    var currid = document.getElementById("curr-id").innerHTML;
    resJSON  = await fetch(backend + "memes/prev/" + currid)
        .then(res => res.json())
        .then(ret => {
            setJSONToHTML(ret);
            return ret;
        })
        .catch(
            // err => console.error(err)
        );
}

/* Get next meme from id extracted from the page's #curr-id
*/
async function getNext() {
    var currid = document.getElementById("curr-id").innerHTML;
    resJSON  = await fetch(backend + "memes/next/" + currid)
        .then(res => res.json())
        .then(ret => {
            setJSONToHTML(ret);
            return ret;
        })
        .catch(
            // err => console.error(err)
        );
}

setLatest();

// MEME EDIT MODAL

var modals = document.querySelectorAll("[data-modal]");

modals.forEach(function (trigger) {
  trigger.addEventListener("click", function (event) {
    event.preventDefault();
    var modal = document.getElementById(trigger.dataset.modal);
    modal.classList.add("open");
    var exits = modal.querySelectorAll(".modal-exit");
    exits.forEach(function (exit) {
      exit.addEventListener("click", function (event) {
        event.preventDefault();
        modal.classList.remove("open");
      });
    });
  });
});

/* Similar to the post Meme, but makes a patch request intitated by the #patch elemnet
*/
function patchMeme() {
    const caption = document.getElementById("edit-caption").value;
    const url = document.getElementById("edit-url").value;
    const idToPatch = document.getElementById("curr-id").innerHTML.trim();

    const data = JSON.stringify({
        caption: caption,
        url: url
    });
    const xhr = new XMLHttpRequest()
    xhr.addEventListener('readystatechange', function() {
        if (this.readyState === this.DONE) {
            // console.log(this.responseText)
        }
    });
    xhr.open('PATCH', backend + 'memes/' + idToPatch);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(data);

    setLatest();
}