const { Pool, Client } = require('pg')

const connectionString = "postgresql://localhost:5432/memeDB"

function checkParamsRegex(memeParamsJSON) {
    return((/^[ \.a-zA-Z0-9-_']+$/.test(memeParamsJSON["name"])) 
        && (/^[ \.a-zA-Z0-9-_']+$/.test(memeParamsJSON["caption"])) 
        && (/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(memeParamsJSON["url"]))
        // https://gist.github.com/dperini/729294
        );
}

function checkParamsLen(memeParamsJSON) {
    return (memeParamsJSON["name"].length <= 100 &&
        memeParamsJSON["caption"].length <= 100 && 
        memeParamsJSON["url"].length <= 2048);
}

async function checkParamsUnique(memeParamsJSON) {
    const client = new Client(connectionString);
    try {
        await client.connect();
        let matchingCaptions = await client.query(
            `SELECT caption FROM memeentries
            WHERE url='${memeParamsJSON["url"]}';`);
        matchingCaptions = matchingCaptions.rows;
        for (caption in matchingCaptions) {
            if(matchingCaptions[caption]["caption"] === memeParamsJSON["caption"]) {
                return true;
            }
        }
        return false;
    } catch(err) {
        return err.stack;
    } finally {
        client.end();
    }
}

// USAGE AS:
// checkParamsUnique({"name": "ashok kumar","url": "https://images.pexels.com/photos/3573382/pexels-photo-3573382.jpeg","caption": "This is a meme"})
// .then(res => {console.log(res)});

module.exports  = {
    checkParamsRegex, checkParamsLen, checkParamsUnique
};