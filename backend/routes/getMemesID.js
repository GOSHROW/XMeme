/*  GET /memes/<id> endpoint
    responds 200 on success with requisite fields as a JSON
    responds 404 if id parameter does not resolve to a valid id
    responds 406 if id parameter is illegal
    responds 500 for other cases that may be the fault of the server
*/
const dbops = require("../dbops")

/**
* @swagger
* /memes/{id}:
*   get:
*     tags:
*       - memes
*     name: Get Meme By ID
*     summary: Gets all fields of a Meme as per the ID
*     parameters:
*     - name: "id"
*       in: "path"
*       description: "ID of the meme to be fetched"
*       required: true
*       type: "integer"
*       minimum: 0
*       format: "int64"
*     responses:
*       200:
*         description: Found a valid id and delivered meme properly
*       404:
*         description: The provided id was formatted properly but does not reference any meme
*       406:
*         description: The provided id was formatted incorrectly
*       500:
*         description: Server errors / bugs inhibited this basic operation
*/
module.exports = app => {
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
}