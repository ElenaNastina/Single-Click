const { app, BrowserWindow } = require('electron')

// function to create an set up window
function createWindow() {
    const window = new BrowserWindow({
        width: 800,
        height: 600
    })

    window.loadFile('static/index.html')
    window.menuBarVisible = false
}

// create the window
app.whenReady().then(() => {
    createWindow()
})