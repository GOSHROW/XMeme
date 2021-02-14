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

/**
* @swagger
* /memes:
*   post:
*     tags:
*       - memes
*     name: Post Meme
*     summary: Puts OP's name, caption and image url of meme. Returns id as a JSON
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/postParams'
*     responses:
*       200:
*         description: Posted Successfully
*       409:
*         description: Same content exists
*       414:
*         description: The parameters were unneccesarily lengthy
*       422:
*         description: Unpermissible characters were passed
*       400:
*         description: The parameters were empty or absent
*       500:
*         description: Server errors / bugs inhibited this basic operation
*/

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
            if (err.toString().includes("uniquememeparams")) {
                res.sendStatus(409);
            }
            res.sendStatus(500);
        }
    });
}