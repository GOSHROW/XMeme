/*  PATCH /memes/<id> endpoint
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
    app.patch('/memes/:id', (req, res) => {
        try {
            let idToPatch = req.params.id;
            let paramsJSON = req.body;
            paramsJSON["name"] = "placeholder";
            if (paramsJSON["name"] && paramsJSON["url"] && paramsJSON["caption"]) {
                if (validateFields.checkParamsRegex(paramsJSON)) {
                    if (validateFields.checkParamsLen(paramsJSON)) {
                        (validateFields.checkParamsUnique(paramsJSON))
                        .then(isntUniq => {
                            if(isntUniq) {
                                res.sendStatus(409); // params must not be conflicting
                            } else {
                                var numbers = /^[0-9]+$/;
                                if (numbers.test(idToPatch)) {
                                    dbops.patchField(idToPatch, paramsJSON["caption"], paramsJSON["url"])
                                    .then(ret => {
                                        if (ret) {
                                            // console.log(ret);
                                            res.sendStatus(200);
                                        } else {
                                            res.sendStatus(404);
                                        }
                                    });
                                } else {
                                    res.sendStatus(406) 
                                    // Non-Digit values lead to exceptions at DB implementation stage
                                }
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