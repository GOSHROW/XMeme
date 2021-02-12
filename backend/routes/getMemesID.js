/*  GET /memes/<id> endpoint
    responds 200 on success with requisite fields as a JSON
    responds 404 if id parameter does not resolve to a valid id
    responds 406 if id parameter is illegal
    responds 500 for other cases that may be the fault of the server
*/

const dbops = require("../dbops")

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