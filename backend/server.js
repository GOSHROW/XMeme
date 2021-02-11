const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
app.use(cors())
app.use(express.json())

const dbops = require('./dbops');
const validateFields = require('./validateFields');

// dbops.initTable(); 
// sets up a postgresql table for further api calls to act upon

/*  wrong / un-implemented endpoints will be a 4xx response
    AS per maturity level 5 redirect to the swagger docs once implemented 
*/
app.get('/', (req, rest) => {
    res.sendStatus(501); // for now
});

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
    } catch(err) {
        res.sendStatus(500);
        return;
    }
});

/*  GET /memes endpoint
    no request properties
    responds 200 on success, with 100 memes in given format 
    responds 500 on failure since get100latestPOST can typically
     only suffer failure on behalf of the server's errors
*/

app.get('/memes/trendy', (req, res) => {
    try {
        dbops.getMostActive(100).then(ret => {
            res.send(ret);
            return;
        });
    } catch(err) {
        res.sendStatus(500);
        return;
    }
});

/*  GET /memes/<id> endpoint
    responds 200 on success with requisite fields as a JSON
    responds 404 if id parameter does not resolve to a valid id
    responds 406 if id parameter is illegal
    responds 500 for other cases that may be the fault of the server
*/

app.get('/memes/:id', (req, res) => {
    try {
        const id = req.params.id
        var numbers = /^[0-9]+$/;
        if (numbers.test(id)) {
            dbops.getMeme(id).then(ret => {
                if (ret) {
                    res.send(ret);
                } else {
                    res.sendStatus(404);
                }
            });
        } else {
            res.sendStatus(406) 
            // Non-Digit values lead to exceptions at DB implementation stage
        }
    } catch(err) {
        res.sendStatus(500);
    }
});

/*  POST /memes endpoint
    responds 200 and returns id of newly added meme on success
    responds 409 if same content and url are pre-existing
    responds 414 if too long params
    responds 422 if unpermissible characters are passed
    responds 400 if parameters are empty or absent
    responds 500 for other exceptions assuming a server error
*/

app.post('/memes', (req, res) => {
    try {
        let paramsJSON = req.body;
        if (paramsJSON["name"] && paramsJSON["url"] && paramsJSON["caption"]) {
            if (validateFields.checkParamsRegex(paramsJSON)) {
                if (validateFields.checkParamsLen(paramsJSON)) {
                    (validateFields.checkParamsUnique(paramsJSON))
                    .then(isntUniq => {
                        if(isntUniq) {
                            res.sendStatus(409); // params must not be conflicting
                        } else {
                            dbops.insertMeme(paramsJSON["name"], 
                                paramsJSON["caption"], paramsJSON["url"])
                            .then(ret => {
                                res.send(ret);
                            });
                        }
                    });
                } else {
                    res.sendStatus(414); // parameter limit must be within the bounds as in DB
                }
            } else {
                res.sendStatus(422); // want to avoid anyone from using characters probable in an XSS
            }
        } else {
            res.sendStatus(400); // any of the compulsory fields are missing
        }
    } catch(err) {
        if (err.includes("uniquememeparams")) {
            res.sendStatus(422);
        }
        res.sendStatus(500);
    }
});



app.listen(port, () =>
  console.log(`xMeme backend listening on port ${port}`),
);