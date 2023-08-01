const express = require('express');
const app = express();
const mysql = require('mysql')
const axios = require('axios')
const cors = require('cors');
const multer = require('multer'); // This is used for multipart post i.e. from a form. Can send files

const path = require('path'); // Used for concatenation to create a path
const { url } = require('inspector');
app.use(cors());
const upload = multer();

// Point to static pages
app.use(express.static(path.join(__dirname, './public/html')));  // Client requests files relative to here - i.e. no path needed
app.use(express.static(path.join(__dirname, './public/css')));  
app.use(express.static(path.join(__dirname, './public/js')));  

app.use(express.urlencoded({ extended: true })) // Detect url encoded data in http and add to req body
app.use(express.json()); // Detect json data and put it into the req.body


//*** Add swagger doc generation code
// swagger-jsdoc reads annotated source code and creates an openAPI spec
const swaggerJsDoc = require('swagger-jsdoc'); // Details at npmjs.com/package/swagger-jsdoc

// swagger-ui-express serves up the auto generated documentation as an API
const swaggerUI = require('swagger-ui-express');

// Now setup the options as described in the npm docs.
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Deliver Jokes Server',
      version: '1.0.0',
      description: `Demonstrates some http methods and associated paths related to the deliver service
      using a code first approach`,
    },
  },
  apis: ['deliver_app.js'], // If you have other files, you can use a wild card e.g. ./public/js/*.js or list them
};

const swaggerDocs = swaggerJsDoc(options); // Create the document object. Pass in options obj
console.log(swaggerDocs); // Use this to check all is working then take it out

// Now add app.use. This will create an API path to uor documentation. The functions passed in are
// available to all routes
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
// Now add the route documentation. You can use @swagger or @openapi. This is in YAML format
// ***


// Connection string
let conStr = {
  host: 'localhost',
  user: 'root',
  password: 'wutheringheights4569@',
  database: 'joke_norm'
}

// Create connection and provide access vis db
const db = mysql.createConnection(conStr);

// Make the connection
db.connect((err) => {
    if(err){
        console.log('Error connecting to DB');
        console.log(err);
        return;
    }
    console.log('Connected to MySQL Database');
});


//setting up homepage
app.get("/",(req,res)=>
{
    res.sendFile('./public/html/jokes.html', { root: __dirname }); // path is relative to the execution path __dirname
});

/**
* @swagger
* paths:
*   /jokes:
*      get:
*         summary: Get jokes from My SQL Database
*         content:
*               application/json:
*                 schema:
*                   $ref: '#/components/schemas/jokes'
*               multipart/form-data:
*                 schema:
*                   $ref: '#/components/schemas/jokes'
*               application/x-www-form-urlencoded:
*                 schema:
*                   $ref: '#/components/schemas/jokes'
*         responses:
*           '200':
*             description: jokes returned successfully.
*           '404':
*             description: jokes not found.
* 
*   /types:
*     get:
*       summary: Get jokes types from MySQL Database
*       content:
*            application/json:
*              schema:
*                $ref: '#/components/schemas/types'
*            multipart/form-data:
*              schema:
*                $ref: '#/components/schemas/types'
*            application/x-www-form-urlencoded:
*              schema:
*                $ref: '#/components/schemas/types'
*       responses:
*         '200':
*           description: joke types returned successfully.
*         '404':
*           description: joke types not found.
* 
*   /receiveModJoke:
*      post:
*        summary: Add joke received from moderator to My SQL Database
*        requestBody:
*          required: true
*          content:
*            application/json:
*              schema:
*                $ref: '#/components/schemas/receiveModJoke'
*            multipart/form-data:
*              schema:
*                $ref: '#/components/schemas/receiveModJoke'
*            application/x-www-form-urlencoded:
*              schema:
*                $ref: '#/components/schemas/receiveModJoke'
*        responses:
*          200:
*           description: Request succeeded. Everything is OK
*          201:
*            description: Created Joke
*          500:
*            description: Server Error
* 
* components:
*   schemas:
*     jokes:
*       type: array
*       items:
*         type: object
*       properties:
*         id:
*           type: integer
*           description: unique id of joke type
*           example: 2
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
*     types:
*           type: array
*           items:
*             type: object
*           properties:
*             id:
*               type: integer
*               description: unique id of joke type
*               example: 2
*             type:
*               type: string
*               description: this is the type of joke returned
*               example: dad   
*     receiveModJoke:
*           type: object
*           properties:
*             type_id:
*               type: integer
*               description: unique id of joke type
*               example: 2
*             setup:
*               type: string
*               description: this is the joke setup
*               example: Why do fathers take an extra pair of socks when they go golfing?
*             punchline:
*               type: string
*               description: this is the joke punchline
*               example: In case they get a hole in one  
* 
*/

// Return all rows from jokes table
app.get('/jokes', (req, res) => {
  sql = `SELECT * FROM tbl_jokes`

  db.query(sql, (err, results) => {
    if (err) res.status(500)
    else
      res.json(results)
  })
})


// Return all rows from types table
app.get('/types', (req, res) => {
  sql = `SELECT * FROM tbl_type`

  db.query(sql, (err, results) => {
    if (err) res.status(500)
    else
      res.json(results)
  })
})

//-----------------------------------------------------------------------------------//


// Call Moderate Jokes Service for Joke Types
app.get('/submittedJoke', async ( req, res) =>{
  try{
    console.log(res)
  } catch(err)
  {
    res.sendStatus(err)
  }
})

// post joke from mod
app.post('/receiveModJoke', async (req, res) => {

  // get submitted joke from moderator
  const joke = req.body;

  // get joke type
  let jokeType = req.body.type;
  let typeID = 0;

  try{

    // declare sql query that checks if type exists in tbl_type
    existTypeQuery = "SELECT EXISTS (SELECT 1 FROM tbl_type WHERE type = ?) as isPresent"

    // query database tbl_type with SQL query and value
    db.query(existTypeQuery, jokeType, (err, results) => {

      if (err) throw err;

      //check if type is present in tbl_type
      if(results[0].isPresent){

        // declare sql query to select id if joke type matches type from tbl_type
        checkTypeQuery = "SELECT id as typeID FROM tbl_type WHERE type = ?" ; 

        db.query(checkTypeQuery, jokeType, (err, results) => {
          if (err) throw err;

          // if yes store in typeID
          // res.json(results)
          console.log(results)
          typeID = results[0].typeID;
          console.log("typeID:",typeID)

          // declare sql query to insert new record to database with values typeID, setup and punchline
          var addJokeQuery = "INSERT INTO tbl_jokes (type, setup, punchline) VALUES ?";
          var values = [[typeID, joke.setup, joke.punchline]];

          // query database tbl_jokes with SQL query and values
          db.query(addJokeQuery,  [values], function (err, results) {
            if (err) throw err;

            // display number of records inserted 
            console.log("Number of records inserted: " + results.affectedRows);
          });

        });
  
      }
      else{

        try{

          // if not declare a query to add new type to type table and store typeID
          addTypeQuery = "INSERT INTO tbl_type (type) VALUES (?)";

          db.query(addTypeQuery, jokeType, (err, results) => {
            if (err){
              console.log(err)
              throw err;
            }

            // store new id in typeID
            typeID = results.insertId;
  
            // display number of records inserted and id
            console.log("Number of types inserted: " + results.affectedRows);
            console.log("Type id: " + results.affectedRows);

  
            // declare sql query to insert new record to database with values typeID, setup and punchline
            var addJokeQuery = "INSERT INTO tbl_jokes (type, setup, punchline) VALUES ?";
            var values = [[typeID, joke.setup, joke.punchline]];

            // query database tbl_jokes with SQL query and values
            db.query(addJokeQuery,  [values], function (err, results) {
              if (err) throw err;

              // display number of records inserted 
              console.log("Number of records inserted: " + results.affectedRows);
            });
              
          });

        } catch(err){
          console.log(err.message)
          res.sendStatus(err);

        }

      }

      res.sendStatus(201);
      
    });

  }catch(err){
    res.sendStatus(err);
  }

})



app.get('/*', (req, res)=>{
  res.status(404).sendFile(path.join(__dirname, '/public/html/404.html'));
})

app.listen(3000, () => console.log(`Listening on port 3000`))















//-------------------------------------------------------------//

// Call Submit Jokes Service for Joke Types . Remove later
// app.get('/submitJokeTypes', async (req, res) =>{
//   try {
//     const URL= 'http://localhost:3002/types'
//     const types = await axios.get(URL);

//     res.json(types.data)
//     console.log(types.data)

//   } catch (err) {
//     res.send(err.message)
//     console.log(err.message)
//   }

// })
