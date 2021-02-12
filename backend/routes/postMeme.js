/*  POST /memes endpoint
    responds 200 and returns id of newly added meme on success
    responds 409 if same content and url are pre-existing
    responds 414 if too long params
    responds 422 if unpermissible characters are passed
    responds 400 if parameters are empty or absent
    responds 500 for other exceptions assuming a server error
*/
const dbops = require('../dbops');
const validateFields = require('../validateFields');

module.exports = app => {
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
}