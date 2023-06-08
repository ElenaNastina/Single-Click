const SERVER = "http://localhost:3000/api"
const NOTES_TABLE = document.getElementById("notes")

function deleteNote(event) {
    let id = event.target.dataset["id"]
    event.target.parentElement.parentElement.remove()
    fetch(SERVER + "/delete?id=" + id, {
        method: "POST"
    })
}

function addNote(id, note) {
    let row = document.createElement("tr")
    let noteTd = document.createElement("td")
    let deleteButton = document.createElement("button")
    let deleteTd = document.createElement("td")

    noteTd.innerText = note
    deleteButton.innerText = "X"
    deleteButton.dataset["id"] = id
    deleteButton.onclick = deleteNote

    deleteTd.appendChild(deleteButton)
    row.appendChild(noteTd)
    row.appendChild(deleteTd)

    NOTES_TABLE.appendChild(row)
}

function uploadNote(note) {
    fetch(SERVER + "/upload?note=" + encodeURIComponent(note), {
        method: "POST"
    }).then(async (data) => {
        let id = await data.text()
        addNote(id, note)
    })
}

function handleAddButton() {
    let note = document.getElementById("note").value
    document.getElementById("note").value = ""
    console.log(note)
    uploadNote(note)
}

fetch(SERVER + "/get").then(async (res) => {
    let notes = await res.json()
    notes.forEach((data) => {
        let id = data["id"]
        let note = data["note"]
        addNote(id, note)
    })
})