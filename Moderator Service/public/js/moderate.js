const BASE_URL = "http://localhost:3001";

let jokeEndpoint = BASE_URL + "/joke";
let jokesEndpoint = BASE_URL +"/jokes"
let submitEndpoint = BASE_URL + "/submitJoke";
let deleteEndpoint = BASE_URL + "/deleteCurrentJoke/";
let jokeTypeEndpoint = BASE_URL + "/jokeTypes";

// Variable Declarations
let Jokeid =0;
let jokes = [];
let currentIndex =0;
let submitButton = document.getElementById('submit-btn');


function submitForm()
{
  let loginForm = document.getElementById('login-form');
  let successMessage = document.getElementById('success-message');

  console.log("We were here")

  
  const checkUsername = () =>{
  
    let usernameValid = false;
    let usernameInput = document.getElementById('username').value;
    let errorMessage = document.getElementById('error-message-username');

    if(!isBetween(usernameInput.length, 5, 10)){
      console.log("Entered length check");
      errorMessage.innerHTML = "Username must be between 5 and 10 characters";
    }
    else{ 
      usernameValid = true;
      errorMessage.innerHTML = " ";
    }

    return usernameValid;
  }

  // check for input values in password
  const checkPassword = () =>{

    let passwordValid = false;
    let passwordInput = document.getElementById('password').value;
    let errorMessage = document.getElementById('error-message-password');

    errorMessage.innerHTML = " ";

    if(!isBetween(passwordInput.length, 8, 12)){
      errorMessage.innerHTML = "Password must be between 8 and 12 characters";
    }
    else if (!isSecure(passwordInput)){
      errorMessage.innerHTML = "Password must contain at least 1 uppercase, 1 lowercase character, and 1 number";
    }
    else{ 
      passwordValid = true;
      errorMessage.innerHTML = " ";
    }
    return passwordValid;
  }

  let UsernameValid = checkUsername();
  let PasswordValid = checkPassword();
  if(UsernameValid && PasswordValid){
    successMessage.innerHTML = "Validation successful!";
    loginForm.method = "post";
    loginForm.action = "/signup";
    loginForm.submit();
  
  }


  // check confirm password



}

// Declare Utility functions

// Validate input is provided
function hasValue(value){
  if (value === '' || value == null) return false;
  else true;
}

// Validate input length
function isBetween(length, min, max)
{
  if(length < min || length > max) return false;
  else return true;
}

// Validate password Strength
function isSecure(password)
{
  const regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])");
  return regex.test(password);
}


// Get all jokes
async function getJokes()
{
  try
  {
    let response =  await fetch(jokesEndpoint);
    let jokeObj = await response.json();
    return jokeObj;
  }
  catch(error)
  {
    console.log(error);
  }
}

// fetch joke types from Deliver endpoint
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


// Add updated options from deliver service
async function addOptions(){
  let jokeTypes = await getJokeTypes();
  var select = document.getElementById("joke_type");

  for (let i = 0; i < jokeTypes.length; i++) {
      select.options[select.options.length] = new Option(jokeTypes[i].type);
  }
}

// changes joke type in input field to the one selected
function changeJoke(){
  var option = document.getElementById('joke_type').value;
  document.getElementById('type').value = option;
}

// request jokes 
function requestJokes()
{
    displayJoke();
}

// display jokes
function displayJokes(index)
{
  console.log(currentIndex);

  Jokeid = jokes[index]._id;
  document.getElementById("id").value = Jokeid;
  document.getElementById("type").value = jokes[index].type;
  document.getElementById("setup").value = jokes[index].setup;
  document.getElementById("punchline").value = jokes[index].punchline;

}


function submitJoke(){

  let jokeForm = document.getElementById('my-form');

  jokeForm.method = "post";
  jokeForm.action = "/submitJoke";
  jokeForm.submit();

  requestJokes();
  // retrieve element values id, type, set up and punchline
  // call submit endpoint and pass type, setup and punchline
  // call delete endpoint and pass id
  // cal requets jokes

}


// test
function nextJoke(){
  
  document.getElementById("type").value = "";
  document.getElementById("setup").value = "";
  document.getElementById("punchline").value = "";

  if(currentIndex < jokes.length - 1){
    currentIndex =(currentIndex + 1);
    displayJokes(currentIndex)

  }
  else{
    document.getElementById("id").value = "";
    document.getElementById("type").value = "";
    document.getElementById("setup").value = "";
    document.getElementById("punchline").value = "";
    console.log("No more jokes to moderate!")
    alert("No jokes to moderate!");
  }

}
  



async function getJoke()
{
  try
  {
    let response =  await fetch(jokeEndpoint);
    let jokeObj = await response.json();
    return jokeObj;
  }
  catch(error)
  {
    console.log(error);
  }
}

async function displayJoke()
{
  let joke = await getJoke();
  var alert = document.getElementById("alert_message");

  if(joke == null)
  {
    alert.style.display = "block";
  } else{

    alert.style.display = "none";

    Jokeid = joke._id;
    // console.log(Jokeid)

    document.getElementById("id").value = Jokeid;
    document.getElementById("type").value = joke.type;
    document.getElementById("setup").value = joke.setup;
    document.getElementById("punchline").value = joke.punchline;
  }

}

async function onDeleteJoke(){

  try {
    const response = await fetch(deleteEndpoint + `${Jokeid}`);
    console.log(response.body);
  } catch (err) {
    console.error(err);
  }

  document.getElementById("id").value = "";
  document.getElementById("type").value = "";
  document.getElementById("setup").value = "";
  document.getElementById("punchline").value = "";
  requestJokes();

}