/* date/name/class / program desciption  */

//Importing database and web serving libraries for use later
const app = require('express')()
const Database = require('./database')
const fs = require('fs')

//Set the default port
const PORT = 3000

//Create config directory if it doesn't already exist, and load db file
fs.mkdirSync('./config', { recursive: true })
//Instantiate and initialize db if it isn't yet
const db = new Database('./config/data.db')

//Setup path to get all the notes
app.get('/api/get', async (req, res) => {
    //Get data from database
    let notes = await db.getFromDatabase()
    
    //Return the notes
    res.status(200).send(notes)
})

//Setup path to upload notes
app.post('/api/upload', async (req, res) => {
    //Get note from request, and return 400 if it's not there
    let note = req.query["note"]
    if (!note) {
        return res.sendStatus(400)
    }

    //Save note into database
    let id = await db.putIntoDatabase(note)

    //Return http ok (200)
    res.status(200).send(id.toString())
})

//Set up path to delete notes
app.post('/api/delete', async (req, res) => {
    //Get id from request, and return 400 if it's not there
    let id = req.query["id"]
    if (!id) {
        return res.sendStatus(400)
    }

    //Remove chosen id from db
    let newNotes = await db.deleteFromDatabase(id)

    //Return http ok (200)
    res.status(200).send(newNotes)
})

//Serve the application on port 3000
app.listen(PORT)