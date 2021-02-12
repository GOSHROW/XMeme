/*  GET /memes/prev/<offset> endpoint
    responds 200 on success with requisite fields as a JSON
    responds 404 if the endpoint could not be resolved
    responds 406 if offset parameter is illegal
    responds 500 for other cases that may be the fault of the server
    Used in index page for unit pagination
*/
const dbops = require("../dbops")

/**
* @swagger
* /memes/prev/{offset}:
*   get:
*     tags:
*       - memes
*     name: Get Previous 
*     summary: Gets previous meme if available as per id (taken as an offset)
*     parameters:
*     - name: "offset"
*       in: "path"
*       description: "id of the meme whose previous is to be found"
*       required: true
*       type: "integer"
*       minimum: 0
*       format: "int64"
*     responses:
*       200:
*         description: Found a valid id and delivered its previous meme(s) properly
*       404:
*         description: The provided id was formatted properly but has no previous meme
*       406:
*         description: The provided id was formatted incorrectly
*       500:
*         description: Server errors / bugs inhibited this basic operation
*/
module.exports = app => {
    app.get('/memes/prev/:offset', (req, res) => {
        try {
            var offset
            if (req.params.offset) {
                offset = req.params.offset
            } else {
                offset = ""
            }
            var numbers = /^[0-9]+$/
            if (numbers.test(offset)) {
                dbops.getPrevious(offset).then(ret => {
                    if (ret) {
                        res.send(ret);
                    } else {
                        res.sendStatus(404);
                    }
                });
            } else {
                res.sendStatus(406)
            }
        } catch(err) {
            res.sendStatus(500);
        }
    });
}