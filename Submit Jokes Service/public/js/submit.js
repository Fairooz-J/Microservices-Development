const DEST = "http://localhost:3002";
let jokeTypeEndpoint = DEST + "/jokeTypes";

// Get Joke types from Deliver Service Database
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

async function addOptions(){
    let jokeTypes = await getJokeTypes();
	var select = document.getElementById("joke_type");

    for (let i = 0; i < jokeTypes.length; i++) {
        select.options[select.options.length] = new Option(jokeTypes[i].type);
    }
}