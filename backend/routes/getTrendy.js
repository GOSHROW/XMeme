/*  GET /trends endpoint
    no request properties
    responds 200 on success, with 100 memes in given format 
    responds 500 on failure since get100latestPOST can typically
     only suffer failure on behalf of the server's errors
*/
const dbops = require('../dbops');

/**
* @swagger
* /trends:
*   get:
*     tags:
*       - memes
*     name: Get Trendy Memes
*     summary: Gets all fields of max 10 latest modified, posted or liked memes
*     responses:
*       200:
*         description: Found and delivered all memes properly
*       500:
*         description: Server errors / bugs inhibited this basic operation
*/
module.exports = app => {
    app.get('/trends', (req, res) => {
        try {
            dbops.getMostActive(10).then(ret => {
                res.send(ret);
                return;
            });
        } catch(err) {
            res.sendStatus(500);
            return;
        }
    });
}