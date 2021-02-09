const express = require('express');
const app = express();
const port = 3000;

const dbops = require('./dbops');
const validateFields = require('./validateFields');

dbops.initTable(); 
// sets up a postgresql table for further api calls to act upon


/*  GET /memes endpoin
    no request properties
    responds 200 on success, with 100 memes in given format 
    responds 404 on failure in resolving the request
*/

app.get('/memes', (req, res) => {
    try {
        dbops.get100LatestPOST().then(latest100 => {
            // removing and modifying return fields as requisite
            for (var elt = 0; elt < latest100.length; elt++) {
                delete latest100[elt]["modified"];
                delete latest100[elt]["likes"];
                latest100[elt]["url"] = latest100[elt]["imageURL"];
                delete latest100[elt]["imageURL"];
                latest100[elt]["name"] = latest100[elt]["username"];
                delete latest100[elt]["username"];
            }
            res.send(latest100);
            return;
        });
    } catch {
        res.send(404);
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