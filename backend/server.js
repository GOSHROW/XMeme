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
const swaggerApp = express();
const swaggerPort = 8080;
swaggerApp.use(cors());

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: 'Swagger for xMeme @ GOSHROW',
        version: '1.0.0',
        description: 'Endpoints to fully access the xMeme Web-App',
    },
    contact: {
        email: "goshrow@gmail.com",
    },
    license: {
        name: "GNU General Public License v3.0",
        url: "https://www.gnu.org/licenses/gpl-3.0.en.html",
    },
    tags: [
        {
            name: "memes",
            description: "Definite route to handle all operations hereon",
        },
    ],
    host: 'localhost:8081',
    basepath: '/',
    servers: [
        {
            url: 'http://localhost:8081/',
            description: 'Local server',
        },
    ],
    "components": {
        "schemas": {
          "patchParams": {
            "properties": {
              "url": {
                "type": "string",
                "required": "true",
              },
              "caption": {
                "type": "string",
                "required": "true",
              },
            },
          },
          "postParams": {
            "properties": {
            "name": {
                  "type": "string",
                  "required": "true",
                },
              "url": {
                "type": "string",
                "required": "true",
              },
              "caption": {
                "type": "string",
                "required": "true",
              },
            },
          },
        },
      },
};

const options = {
    swaggerDefinition,
    apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);
app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});
swaggerApp.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/*  wrong / un-implemented endpoints will be a 4xx response
    AS per maturity level 5, the root redirects to the swagger docs 
*/
app.get('/', (req, res) => {
    try {
      res.redirect('http://localhost:8080/swagger-ui');
    } catch {
      res.sendStatus(404)
    }
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
swaggerApp.listen(swaggerPort, () => 
    console.log('Swagger Up at ' + swaggerPort),
);