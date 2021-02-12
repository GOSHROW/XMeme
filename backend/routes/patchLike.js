/*  PATCH /memes/likes/<id> endpoint
    responds 200 on success with requisite fields as a JSON
    responds 404 if the endpoint could not be resolved
    responds 406 if id parameter is illegal
    responds 500 for other cases that may be the fault of the server
    Provides a streamline to like pictures
*/
const dbops = require('../dbops');
const validateFields = require('../validateFields');

module.exports = app => {
    app.patch('/memes/likes/:id', (req, res) => {
        try {
            var id = req.params.id
            var numbers = /^[0-9]+$/
            if (numbers.test(id)) {
                dbops.incrementLike(id).then(ret => {
                    if (ret) {
                        res.send(ret);
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