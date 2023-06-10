const { app, BrowserWindow } = require('electron')

//Function to create and set up a web window
function createWindow() {
    //new browser window instance
    const window = new BrowserWindow({
        width: 800,
        height: 600
    })

    //Opens the default page and hides the menu bar
    window.loadFile('static/index.html')
    window.menuBarVisible = false
}

//Create the window using the previous function
app.whenReady().then(() => {
    createWindow()
})