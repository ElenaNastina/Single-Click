/* date/name/class / program desciption  */

//Importing database and web serving libraries for use later
const sqlite3 = require('sqlite3')
const app = require('express')()
const fs = require('fs')

//Set the default port
const PORT = 3000

//Create config directory if it doesn't already exist, and load db file
fs.mkdirSync('./config', { recursive: true })
const db = new sqlite3.Database('./config/data.db')

//Function to create db
function initializeDatabase() {
    // create the needed table if doesn't exist
    // layout:
    //
    // data: (table)
    // id | note
    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS data (id INTEGER PRIMARY KEY, note TEXT)")
    })
}

//Function to get all notes in the db (data table)
function getFromDatabase() {
    return new Promise((res, rej) => {
        //Get all notes from db
        db.all("SELECT id, note FROM data", (err, rows) => {
            if (err) {
                rej(err)
            }
            //if there is no error, return the notes
            res(rows)
        })
    })
}

//Function to put a note into the db
function putIntoDatabase(note) {
    //Insert the given note into the db, returning the new id
    return new Promise((res, _) => {
        db.serialize(() => {
            let stmt = db.prepare("INSERT INTO data VALUES (NULL, ?)")
            stmt.run(note, function() {
                res(this.lastID)
            })
            stmt.finalize()
        })
    })
}

//Function to delete a note from the db, given the ID
function deleteFromDatabase(id) {
    return new Promise((res, _) => {
        db.serialize(() => {
            //Delete given id (with sanitization) and return new db
            let stmt = db.prepare("DELETE FROM data WHERE id=?")
            stmt.run(id)
            stmt.finalize(async (_) => {
                res(await getFromDatabase())
            })
        })
    })
}

//Setup path to get all the notes
app.get('/api/get', async (req, res) => {
    //Get data from database
    let notes = await getFromDatabase()
    
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
    let id = await putIntoDatabase(note)

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
    let newNotes = await deleteFromDatabase(id)

    //Return http ok (200)
    res.status(200).send(newNotes)
})

//Initialize db if it isn't yet
initializeDatabase()

//Serve the application on port 3000
app.listen(PORT)