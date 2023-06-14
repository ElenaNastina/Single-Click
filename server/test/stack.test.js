const Database = require('../database')
const fs = require('fs')

//Function to get all tables inside the db
function getTables(db) {
    return new Promise((res, rej) => {
        db.all("SELECT name FROM sqlite_schema WHERE type='table'", (err, rows) => {
            if (err) {
                rej(err)
            }
            res(rows)
        })
    })
}

//Function to close the db
function closeDB(db) {
    return new Promise((res, _) => {
        db.close(() => {
            res()
        })
    })
}

describe('Database', () => {
    //Before each test is ran create a new temporary database
    let db
    beforeEach(() => {
        db = new Database(':memory:')
    })

    //Check that db is empty when it gets created
    it('initializes correctly', async () => {
        let tables = await getTables(db.db)
        tables = tables.map(rows => rows.name)
        expect(tables).toContain("data")
    })

    //Check that we can successfully read/write/delete notes and list them
    it('can manipulate/list notes', async () => {
        let emptyDB = await db.getFromDatabase()
        expect(emptyDB).toEqual([])

        let firstItemId = await db.putIntoDatabase("testing stuff 1")
        expect(firstItemId).toBe(1)

        let secondItemId = await db.putIntoDatabase("testing stuff 2")
        expect(secondItemId).toBe(2)

        let thirdItemId = await db.putIntoDatabase("testing stuff 3")
        expect(thirdItemId).toBe(3)

        await db.deleteFromDatabase(secondItemId)

        let newDB = await db.getFromDatabase()
        expect(newDB).toEqual([
            {
                "note": "testing stuff 1",
                "id": 1
            },
            {
                "note": "testing stuff 3",
                "id": 3
            }
        ])
    })

    //Check that when the db restarts it does not get deleted
    it('persists between restarts', async () => {
        const TEST_DB = "./test.db"

        let dbExists = fs.existsSync(TEST_DB)
        if (dbExists) {
            fs.rmSync(TEST_DB)
        }
        let db = new Database(TEST_DB)
        let randomData = JSON.stringify(Math.random())
        await db.putIntoDatabase(randomData)
        let dataInDB = await db.getFromDatabase()
        await closeDB(db.db)

        db = new Database(TEST_DB)
        let notes = await db.getFromDatabase()
        expect(notes).toEqual(dataInDB)

        await closeDB(db.db)
        fs.rmSync(TEST_DB)
    })
})