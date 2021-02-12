const express = require('express');
const cors = require('cors');
const app = express();
const port = 8081;
app.use(cors())
app.use(express.json())

// set up a postgresql table for further api calls to act upon
const dbops = require('./dbops');
dbops.initTable(); 

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
    info: {
      title: 'Swagger for xMeme @ GOSHROW',
      version: '1.0.0',
      description: 'Endpoints to fully access the xMeme Web-App',
    },
    host: 'localhost:8080',
    basePath: '/'
};

const options = {
    swaggerDefinition,
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/*  wrong / un-implemented endpoints will be a 4xx response
    AS per maturity level 5 redirect to the swagger docs once implemented 
*/
app.get('/', (req, res) => {
    res.sendStatus(501); // for now
});

require('./routes/getMemes')(app);
require('./routes/getMemesID')(app);
require('./routes/getNewest')(app);
require('./routes/getNext')(app);
require('./routes/getPrev')(app);
require('./routes/getTrendy')(app);
require('./routes/patchLike')(app);
require('./routes/patchMeme')(app);
require('./routes/postMeme')(app);

app.listen(port, () =>
  console.log(`xMeme backend listening on port ${port}`),
);