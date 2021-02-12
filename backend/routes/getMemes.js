/*  GET /memes endpoint
    no request properties
    responds 200 on success, with 100 memes in given format 
    responds 500 on failure since get100latestPOST can typically
     only suffer failure on behalf of the server's errors
*/
const dbops = require('../dbops');

/**
* @swagger
* /memes:
*   get:
*     tags:
*       - memes
*     name: Get Meme
*     summary: Gets id, name, caption, url of max 100 latest memes
*     responses:
*       200:
*         description: Found and delivered all memes properly
*       500:
*         description: Server errors / bugs inhibited this basic operation
*/
module.exports = app => {
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
}
