const mongoose = require('mongoose')
// const regexEscape = require('regex-excape')


mongoose.connect("mongodb+srv://fzjalal:fzjokes3435@cluster0.yj6onqu.mongodb.net/JokesApp",{ useNewUrlParser: true })

// mongodb+srv://fzjalal:<password>@cluster0.yj6onqu.mongodb.net/test

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', (res) => console.log(`MongoDB server started JokesApp`))

// create data schema
const jokeSchema = new mongoose.Schema({
    type:{
        type: String,
        required: true
    },
    setup:{
        type: String,
        required: false
    },
    punchline:{
        type:String,
        required: false
    }
})

// Compile model into a schema
const jokeModel = mongoose.model("Jokes", jokeSchema)

async function addJoke(jokeSample) {
    let joke = new jokeModel({
        type: jokeSample.type,
        setup: jokeSample.setup,
        punchline: jokeSample.punchline
    });
    console.log(joke); // remove later
    await jokeModel.create(joke) // Create new document in the database
}

// Probably not needed. Remove later    
async function getJokeTypes(){
    return await jokeModel.find().select({ type: 1, _id: 0 });
}

async function getJokes(){
    return await jokeModel.find();
}

async function getJoke(){
    return await jokeModel.findOne();
}

async function deleteJoke(jokeID) {
    await jokeModel.deleteOne({ _id: jokeID })
}

module.exports = {
    addJoke,
    getJokeTypes,
    getJokes,
    getJoke,
    deleteJoke
}


