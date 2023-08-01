
const delay = ms => new Promise(res => setTimeout(res, ms));

const DEST = "http://localhost:3000";
// const DEST = "http://172.187.216.140:3000";
let jokesEndPoint = DEST + "/jokes";
let jokeTypeEndpoint = DEST + "/types";
let jokesList = [];
let typesList = [];


// ability to copy setup and punchline separately

// get all jokes
async function getJokes()
{
  try
  {
    let response =  await fetch(jokesEndPoint);
    let jokeObj = await response.json();
    console.log('jokes object:', jokeObj)
    return jokeObj;
  }
  catch(error)
  {
    console.log(error);
  }
}


// get up-to-date types
async function getJokeTypes()
{
  try
  {
    let url =  await fetch(jokeTypeEndpoint);
    let typeJson = await url.json();
    return typeJson;
  }
  catch(error)
  {
    console.log(error);
  }
}

// display types
async function addOptions(){
  let jokeTypes = await getJokeTypes();
var select = document.getElementById("joke_type");

  for (let i = 0; i < jokeTypes.length; i++) {
      select.options[select.options.length] = new Option(jokeTypes[i].type);
  }
}

// store what user picks
function getUserType()
{
  let jokeType = document.getElementById("joke_type").value;
  return jokeType;
}

// display a random joke(s) depending on type
async function getJoke()
{
  // jokes stored in an array
  jokesList = await getJokes();
  // types stored in an array
  typesList = await getJokeTypes();

  // check number of jokes requested
  let numJokes = document.getElementById("numJokes").value;

  // Checks if num jokes is 1 or greater
  if(numJokes == 1) displaySingleJoke();
  else  displayMultipleJokes(numJokes);

  // checks for incorrect input, num jokes defaults to 1 if number chosen is less than 1
  if(numJokes < 1) {numJokes = 1; displaySingleJoke();}
  
  // checks for incorrect input - num jokes defaults to lenght of jokes length if number chosen is greater than list
  if(numJokes > jokesList.length) {numJokes = jokesList.length; displayMultipleJokes(numJokes);}
  
}

function stringToNum(stringInput){
  let numOutput;
  filteredList = typesList.find( type => type.type === stringInput);

  numOutput = filteredList.id;

  console.log('num output:', numOutput)
  
  return numOutput;
}

function numToString(numInput){
  // needs doing 
}

async function displaySingleJoke(){

  // clear previous requests
  clearTable();
  clearSingle();

  let userTypeInput = getUserType();
  let usertypeID = stringToNum(userTypeInput);

  console.log(userTypeInput);
  console.log(usertypeID)

  let random = -1;
  let custom_joke_list = [];

  // push jokes into a custom jokes array
  custom_joke_list = jokesList.filter( joke => joke.type === usertypeID);

  random = Math.floor(Math.random() * custom_joke_list.length);
  document.getElementById("setup").innerHTML = custom_joke_list[random].setup;
  await delay(2000);
  document.getElementById("punchline").innerHTML = custom_joke_list[random].punchline;

}

function displayMultipleJokes(numJokes){

  // clear previous requests
  clearTable();
  clearSingle();


  // get table id
  table = document.getElementById("jokeTable");

  // get user input
  let userTypeInput = getUserType();
  let usertypeID = stringToNum(userTypeInput);

  // set random
  let random = -1;

  // filter jokes list into custom list
  let custom_joke_list = [];

  // push jokes into a custom jokes array
  custom_joke_list = jokesList.filter( joke => joke.type === usertypeID);


  // create table row
  for(let i= 1; i <= numJokes; i++)
  {
    // random number between 0 and length of array
    random = Math.floor(Math.random() * custom_joke_list.length);

    let row = table.insertRow(i);
    let cell0 = row.insertCell(0);
    let cell1 = row.insertCell(1);
    let cell2 = row.insertCell(2);
    
    cell0.innerHTML = custom_joke_list[random].type;
    cell1.innerHTML = custom_joke_list[random].setup;
    cell2.innerHTML = custom_joke_list[random].punchline;
        
  }

}

function clearTable(){
  let table = document.getElementById("jokeTable");
  let rowCount = table.rows.length;
  for(let i = rowCount - 1; i > 0; i--)
  {
    table.deleteRow(i);
  }
}

function clearSingle(){

  document.getElementById("setup").innerHTML = "";
  document.getElementById("punchline").innerHTML = "";

}

// copy text
function copyText(id){


  var range = document.createRange();
  range.selectNode(document.getElementById(id));
  window.getSelection().removeAllRanges(); // clear current selection
  window.getSelection().addRange(range); // to select text
  document.execCommand("copy");
  window.getSelection().removeAllRanges();// to deselect

  window.alert("Copied joke");
                
}













