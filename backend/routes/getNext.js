/*  GET /memes/next/<offset> endpoint
    responds 200 on success with requisite fields as a JSON
    responds 404 if the endpoint could not be resolved
    responds 406 if offset parameter is illegal
    responds 500 for other cases that may be the fault of the server
    Used in index page for unit pagination
*/
const dbops = require("../dbops")

module.exports = app => {
    app.get('/memes/next/:offset', (req, res) => {
        try {
            var offset = req.params.offset
            var numbers = /^[0-9]+$/
            if (numbers.test(offset)) {
                dbops.getNext(offset).then(ret => {
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