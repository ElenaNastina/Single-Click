/* date/name */

//two variables to store: server address and notes table
const SERVER = "http://63.35.193.84:3000/api"
const NOTES_TABLE = document.getElementById("notes")

//function to remove a note from the table (delete)
function deleteNote(event) {
    //find ID of the note to delete
    let id = event.target.dataset["id"]
    //delete the note from the table
    event.target.parentElement.parentElement.remove()
    //send a request to the server to delete that note from the db
    fetch(SERVER + "/delete?id=" + id, {
        method: "POST"
    })
}

//function to add a note to table (add)
function addNote(id, note) {
    //create all necessary elements 
    let row = document.createElement("tr")
    let noteTd = document.createElement("td")
    let deleteButton = document.createElement("button")
    let deleteTd = document.createElement("td")

    //set the note and delete button text
    noteTd.innerText = note
    deleteButton.innerText = "X"
    //save the note ID from the database onto the Delete button, to be able to delete the note later
    deleteButton.dataset["id"] = id
    //when button is clicked - delete the note
    deleteButton.onclick = deleteNote

    //fill in elements in one row
    deleteTd.appendChild(deleteButton)
    row.appendChild(noteTd)
    row.appendChild(deleteTd)

    //add the row (above part) to the table
    NOTES_TABLE.appendChild(row)
}

//function to upload a note to the server
function uploadNote(note) {
    //send a request to the server to save a note
    fetch(SERVER + "/upload?note=" + encodeURIComponent(note), {
        method: "POST"
    }).then(async (data) => {
        //get the new note's ID and add it to the table
        let id = await data.text()
        addNote(id, note)
    })
}

//when the add button is pressed, send the note data to the addNote function
function handleAddButton() {
    let note = document.getElementById("note").value
    document.getElementById("note").value = ""
    console.log(note)
    uploadNote(note)
}

//when the page loads, get and display all existing notes
fetch(SERVER + "/get").then(async (res) => {
    let notes = await res.json()
    notes.forEach((data) => {
        let id = data["id"]
        let note = data["note"]
        addNote(id, note)
    })
})