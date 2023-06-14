//Importing database library for use later
const sqlite3 = require('sqlite3')

class Database {
    //Function to initialize db
    constructor(directory) {
        this.db = new sqlite3.Database(directory)
        
        // create the needed table if doesn't exist
        // layout:
        //
        // data: (table)
        // id | note
        this.db.serialize(() => {
            this.db.run("CREATE TABLE IF NOT EXISTS data (id INTEGER PRIMARY KEY, note TEXT)")
        })
    }

    //Function to get all notes in the db (data table)
    getFromDatabase() {
        return new Promise((res, rej) => {
            //Get all notes from db
            this.db.all("SELECT id, note FROM data", (err, rows) => {
                if (err) {
                    rej(err)
                }
                //if there is no error, return the notes
                res(rows)
            })
        })
    }

    //Function to put a note into the db
    putIntoDatabase(note) {
        //Insert the given note into the db, returning the new id
        return new Promise((res, _) => {
            this.db.serialize(() => {
                let stmt = this.db.prepare("INSERT INTO data VALUES (NULL, ?)")
                stmt.run(note, function() {
                    res(this.lastID)
                })
                stmt.finalize()
            })
        })
    }
    
    //Function to delete a note from the db, given the ID
    deleteFromDatabase(id) {
        return new Promise((res, _) => {
            this.db.serialize(() => {
                //Delete given id (with sanitization) and return new db
                let stmt = this.db.prepare("DELETE FROM data WHERE id=?")
                stmt.run(id)
                stmt.finalize(async (_) => {
                    res(await this.getFromDatabase())
                })
            })
        })
    }
}

module.exports = Database