const express = require('express')
const app = express()
// const bodyParser = require('body-parser')
const axios = require('axios')
const path = require('path') // Used for concatenation to create a path
const http = require('http');
const cors = require('cors')
const multer = require('multer');

// Point to static pages
app.use(express.static(path.join(__dirname, './public/html')));  // Client requests files relative to here - i.e. no path needed
app.use(express.static(path.join(__dirname, './public/css')));  
app.use(express.static(path.join(__dirname, './public/js'))); 


app.use(express.urlencoded({ extended: true })) // Detect url encoded data in http and add to req body
app.use(express.json()); // Detect json data and put it into the req.body
app.use(cors());
const upload = multer();

const { addJoke, getJokeTypes, getJokes, getJoke, deleteJoke } = require('./model/model');
const { response } = require('express');
const { exit } = require('process');

// Environment variables
const SUBMIT_DEST = 'http://localhost:3000';
let typeList = [];

//*** Swagger doc generation code
// swagger-jsdoc reads annotated source code and creates an openAPI spec
const swaggerJsDoc = require('swagger-jsdoc'); // Details at npmjs.com/package/swagger-jsdoc

// swagger-ui-express serves up the auto generated documentation as an API
const swaggerUI = require('swagger-ui-express');

// Setup options.
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Submit Jokes Server',
      version: '1.0.0',
      description: `Demonstrates some http methods and associated paths related to the submit service
       using a code first approach`,
    },
  },
  apis: ['submit_app.js'], // If you have other files, you can use a wild card e.g. ./public/js/*.js or list them
};

const swaggerDocs = swaggerJsDoc(options); // Create the document object. Pass in options obj
console.log(swaggerDocs); // Use this to check all is working then take it out

// This will create an API path to the documentation. The functions passed in are
// available to all routes
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
// Now add the route documentation. You can use @swagger or @openapi. This is in YAML format
// ***


app.get("/", function(req, res){
    res.sendFile(__dirname + "/public/html/submit.html")
})

/**
* @swagger
* paths:
*   /joke:
*      post:
*        summary: Add joke to database
*        requestBody:
*          required: true
*          content:
*            application/json:
*              schema:
*                $ref: '#/components/schemas/joke'
*            multipart/form-data:
*              schema:
*                $ref: '#/components/schemas/joke'
*            application/x-www-form-urlencoded:
*              schema:
*                $ref: '#/components/schemas/joke'
*        responses:
*          200:
*           description: Request succeeded. Everything is OK
*          201:
*            description: Created Joke
*          500:
*            description: Server Error
*      get:
*         summary: Get joke from MongoDB
*         content:
*               application/json:
*                 schema:
*                   $ref: '#/components/schemas/joke'
*               multipart/form-data:
*                 schema:
*                   $ref: '#/components/schemas/joke'
*               application/x-www-form-urlencoded:
*                 schema:
*                   $ref: '#/components/schemas/joke'
*         responses:
*           '200':
*             description: joke returned successfully.
*           '404':
*             description: joke not found.
* 
*   /jokeTypes:
*     get:
*       summary: Get jokes types from deliver service
*       content:
*            application/json:
*              schema:
*                $ref: '#/components/schemas/jokeTypes'
*            multipart/form-data:
*              schema:
*                $ref: '#/components/schemas/jokeTypes'
*            application/x-www-form-urlencoded:
*              schema:
*                $ref: '#/components/schemas/jokeTypes'
*       responses:
*         '200':
*           description: joke types returned successfully.
*         '404':
*           description: joke types not found.
* 
*   /deleteCurrentJoke/{jokeId}:
*     delete:
*       summary: Delete a joke by ID
*       parameters:
*         - in: path
*           name: jokeId
*           description: ID of the joke to delete
*           required: true
*           schema:
*             type: string
*       responses:
*         '204':
*           description: Joke deleted successfully
*         '404':
*           description: Joke not found
* 
* 
* 
* components:
*   schemas:
*     joke:
*       type: object
*       properties:
*         type:
*           type: string
*           description: this is the type of joke inserted
*           example: dad
*         setup:
*           type: string
*           description: this is the joke setup
*           example: Why do fathers take an extra pair of socks when they go golfing?
*         punchline:
*           type: string
*           description: this is the joke punchline
*           example: In case they get a hole in one
*     jokeTypes:
*             type: array
*             items:
*               type: object
*             properties:
*               id:
*                 type: integer
*                 description: unique id of joke type
*                 example: 2
*               type:
*                 type: string
*                 description: this is the type of joke returned
*                 example: dad
* */


// Create a new document in the collection
app.post('/joke', async (req, res) => {
 try {
    await addJoke(req.body)
    // res.redirect('/'); // redirect to a url
    res.sendStatus(201)
  } catch (err) {
    console.log(err)
    res.sendStatus(500)
  }
})

// Get a single joke from MongoDB
app.get('/joke', async ( req, res) =>{
  try{
    const joke = await getJoke();
    if (joke.length == 0) res.sendStatus(404)
    else
      res.json(joke)
      console.log(joke)
  } catch(err){
    res.sendStatus(500)
  }
})

// Delete book by ID
app.delete('/delete', async (req, res) => {
  try {
    const id = req.params.id;
    id = req.body
    res.send(id);
    console.log(id)
    // const result = deleteJoke(id)
    // res.send(result)
  } catch (err) {
    res.status(500).send(err.message)
  }
})

//-----------------------------------------------------------------------------------//


// Call Deliver Jokes Service for Joke Types

  app.get('/jokeTypes', checkServerStatus,async (req, res) =>{
    try {
      const URL= SUBMIT_DEST + '/types'
      const types = await axios.get(URL);
      typeList = [];
      typeList.push(types.data)
      res.json(typeList[0])
      console.log(typeList[0])
      // res.sendStatus(201)
  
    } catch (err) {
      res.json(typeList[0])
      console.log(err.message)
    }
  
  })

app.delete('/deleteCurrentJoke/:jokeId', async (req, res) => {
  try {
    console.log(req.params.jokeId)

    // check if id exists, if not send and error that id/joke is not found

    await deleteJoke(req.params.jokeId); // delete the joke from the database
    res.status(204).send(); // send a successful response without content
  } catch (err) {
    console.error(err); // log the error to the console for debugging purposes
    res.status(500).send(); // send a server error response if something goes wrong
  }
});

async function checkServerStatus(req, res, next)
{
  try {
    const URL= SUBMIT_DEST + '/'
    axios.get(URL)
    .then((res) => {
      console.log('Server is running');
      return next();
    })
    .catch((error) => {
      return next();
    });

  } catch (err) {
    console.log(err.message)
  }
}

// setInterval(checkServerStatus, 5000);

app.get('/*', (req, res)=>{
  res.status(404).sendFile(path.join(__dirname, '/public/html/404.html'));
})

app.listen(3002, () => console.log('Listening on port 3002'));



























// // Get jokes from MongoDB
// app.get('/jokes', async ( req, res) =>{

//   try{
//     const jokes = await getJokes();
//     if (jokes.length == 0) res.sendStatus(404)
//     else
//       res.json(jokes)
//       console.log(jokes)
//   } catch(err){
//     res.sendStatus(500)
//   }
// })
