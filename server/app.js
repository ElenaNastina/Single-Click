// importing database and web serving libraries for use later
const sqlite3 = require('sqlite3')
const app = require('express')()
const fs = require('fs')

const PORT = 3000

// create config directory if it doesn't already exist, and load db file
fs.mkdirSync('./config', { recursive: true })
const db = new sqlite3.Database('./config/data.db')

function initializeDatabase() {
    // create the need table if doesn't exist
    // layout:
    //
    // data: (table)
    // id | note
    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS data (id INTEGER PRIMARY KEY, note TEXT)")
    })
}

function getFromDatabase() {
    return new Promise((res, rej) => {
        // get all notes from db
        db.all("SELECT id, note FROM data", (err, rows) => {
            if (err) {
                rej(err)
            }
            res(rows)
        })
    })
}

function putIntoDatabase(note) {
    // insert the given note into the db, returning the new id
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

function deleteFromDatabase(id) {
    return new Promise((res, _) => {
        db.serialize(() => {
            // delete given id (with sanitization) and return new db
            let stmt = db.prepare("DELETE FROM data WHERE id=?")
            stmt.run(id)
            stmt.finalize(async (_) => {
                res(await getFromDatabase())
            })
        })
    })
}

// setup request data path
app.get('/api/get', async (req, res) => {
    // get data from database
    let notes = await getFromDatabase()
    
    // return the notes
    res.status(200).send(notes)
})

// setup upload data path
app.post('/api/upload', async (req, res) => {
    // get note from request, and return 400 if it's not there
    let note = req.query["note"]
    if (!note) {
        return res.sendStatus(400)
    }

    // save data into database
    let id = await putIntoDatabase(note)

    // return http ok (200)
    res.status(200).send(id.toString())
})

app.post('/api/delete', async (req, res) => {
    // get id from request, and return 400 if it's not there
    let id = req.query["id"]
    if (!id) {
        return res.sendStatus(400)
    }

    // remove chosen id from db
    let newNotes = await deleteFromDatabase(id)

    // return http ok (200)
    res.status(200).send(newNotes)
})

// initialize db if it isn't yet
initializeDatabase()

// serve the application on port 3000
app.listen(PORT)