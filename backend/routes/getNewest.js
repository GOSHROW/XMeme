/*  GET /memes/newest/<limit> endpoint
    responds 200 on success with requisite fields as a JSON
    responds 404 if the endpoint could not be resolved
    responds 406 if limit parameter is illegal
    responds 500 for other cases that may be the fault of the server
    Will help in paginating the recent requests. To provide some pagination.
*/
const dbops = require("../dbops") 

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