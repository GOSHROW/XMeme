/*  PATCH /likes/<id> endpoint
    responds 204 on success with requisite fields as a JSON
    responds 404 if the endpoint could not be resolved
    responds 406 if id parameter is illegal
    responds 500 for other cases that may be the fault of the server
    Provides a streamline to like pictures
*/
const dbops = require('../dbops');

/**
* @swagger
* /likes/{id}:
*   patch:
*     tags:
*       - memes
*     name: Increment Meme Like
*     summary: Adds 1 to the like counter in DB and make the meme Trending
*     parameters:
*     - name: "id"
*       in: "path"
*       description: "id of the meme whose like counter is to be incremented"
*       required: true
*       type: "integer"
*       minimum: 0
*       format: "int64"
*     responses:
*       204:
*         description: Found a valid id and incremented its like counter properly
*       404:
*         description: The provided id was formatted properly but was not resolved to target row
*       406:
*         description: The provided id was formatted incorrectly
*       500:
*         description: Server errors / bugs inhibited this basic operation
*/
module.exports = app => {
    app.patch('/likes/:id', (req, res) => {
        try {
            var id = req.params.id
            var numbers = /^[0-9]+$/
            if (numbers.test(id)) {
                dbops.incrementLike(id).then(ret => {
                    if (ret) {
                        res.sendStatus(204);
                    } else {
                        res.sendStatus(404);
                    }
                });
            } else {
                res.sendStatus(406);
            }
        } catch {
            res.sendStatus(500);
        }
    });
}