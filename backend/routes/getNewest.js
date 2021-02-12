/*  GET /memes/newest/<limit> endpoint
    responds 200 on success with requisite fields as a JSON
    responds 501 if the endpoint could not be resolved
    responds 406 if limit parameter is illegal
    responds 500 for other cases that may be the fault of the server
    Will help in paginating the recent requests. To provide some pagination.
*/
const dbops = require("../dbops") 

/**
* @swagger
* /memes/newest/{limit}:
*   get:
*     tags:
*       - memes
*     name: Get Newest 
*     summary: Gets n newest memes (as per time of posting), n being provided limit
*     parameters:
*     - name: "limit"
*       in: "path"
*       description: "Number of newest memes to be fetched"
*       required: true
*       type: "integer"
*       minimum: 0
*       format: "int64"
*     responses:
*       200:
*         description: Found a valid limit and delivered meme(s) properly
*       501:
*         description: The provided limit was formatted properly but leads to errors on the DB operation
*       406:
*         description: The provided limit was formatted incorrectly
*       500:
*         description: Server errors / bugs inhibited this basic operation
*/
module.exports = app => {
    app.get('/memes/newest/:limit', (req, res) => {
        try {
            const limit = req.params.limit
            var numbers = /^[0-9]+$/;
            if (numbers.test(limit)) {
                dbops.getNewest(limit).then(ret => {
                    if (ret) {
                        res.send(ret);
                    } else {
                        res.sendStatus(501);
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