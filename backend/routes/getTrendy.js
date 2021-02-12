/*  GET /memes/trendy endpoint
    no request properties
    responds 200 on success, with 100 memes in given format 
    responds 500 on failure since get100latestPOST can typically
     only suffer failure on behalf of the server's errors
*/

const dbops = require('../dbops');

module.exports = app => {
    app.get('/memes/trendy', (req, res) => {
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