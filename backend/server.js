const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
app.use(cors())

const dbops = require('./dbops');
const validateFields = require('./validateFields');

// dbops.initTable(); 
// sets up a postgresql table for further api calls to act upon


/*  GET /memes endpoint
    no request properties
    responds 200 on success, with 100 memes in given format 
    responds 500 on failure since get100latestPOST can typically
     only suffer failure on behalf of the server's errors
*/

app.get('/memes', (req, res) => {
    try {
        dbops.get100LatestPOST().then(ret => {
            res.send(ret);
            return;
        });
    } catch {
        res.send(500);
        return;
    }
});

/*  GET /memes/<id> endpoint
    responds 200 on success with requisite fields as a JSON
*/

app.get('/memes/:id', (req, res) => {
    try {
        dbops.get100LatestPOST().then(ret => {
            res.send(ret);
            return;
        });
    } catch {
        res.send(404);
        return;
    }
});



app.listen(port, () =>
  console.log(`xMeme backend listening on port ${port}`),
);