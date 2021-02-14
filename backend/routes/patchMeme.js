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

/**
* @swagger
* /memes/{id}:
*   patch:
*     tags:
*       - memes
*     name: Patch Meme
*     summary: Updates caption and/or image url of meme at given id
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/patchParams'
*     parameters:
*     - name: "id"
*       in: "path"
*       description: "id of the meme which is to be updated"
*       required: true
*       type: "integer"
*       minimum: 0
*       format: "int64"
*     responses:
*       200:
*         description: Found a valid id and patched properly
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
    app.patch('/memes/:id', (req, res) => {
        try {
            let idToPatch = req.params.id;
            let paramsJSON = req.body;
            paramsJSON["name"] = "placeholder"; // OP's name cannot be updated

            var numbers = /^[0-9]+$/;
            var oldvals;
            if (numbers.test(idToPatch)) {
                dbops.getMeme(idToPatch)
                .then(ret => {
                    if (ret) {
                        oldvals = ret;
                    } else {
                        res.sendStatus(404);
                    }
                }).then(placeholder => {
                    paramsJSON["caption"] = paramsJSON["caption"] ? paramsJSON["caption"] : oldvals["caption"];
                    paramsJSON["url"] = paramsJSON["url"] ? paramsJSON["url"] : oldvals["url"];
                    // console.log(paramsJSON);
                }).then(placeholder => {
                    if (paramsJSON["name"] && paramsJSON["url"] && paramsJSON["caption"]) {
                        if (validateFields.checkParamsRegex(paramsJSON)) {
                            if (validateFields.checkParamsLen(paramsJSON)) {
                                (validateFields.checkParamsUnique(paramsJSON))
                                .then(isntUniq => {
                                    if(isntUniq) {
                                        res.sendStatus(409); // params must not be conflicting
                                    } else {
                                        dbops.patchField(idToPatch, paramsJSON["caption"], paramsJSON["url"])
                                        .then(ret => {
                                            if (ret) {
                                                // console.log(ret);
                                                res.sendStatus(200);
                                            } else {
                                                res.sendStatus(404);
                                            }
                                        });
                                    }
                                });
                            } else {
                                res.sendStatus(414); // parameter limit must be within the bounds as in DB
                            }
                        } else {
                            res.sendStatus(422); // want to avoid anyone from using characters probable in an XSS
                        }
                    }
                });
            } else {
                res.sendStatus(406) 
            }   
        } catch(err) {
            if (err.toString().includes("uniquememeparams")) {
                res.sendStatus(409);
            }
            res.sendStatus(500);
        }
    });
}