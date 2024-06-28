const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('node:path');
const { exec } = require('child_process');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let persistentWindow;
let highlight_checker_process;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width:800,
    height:600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'))
}

function createPersistentWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  persistentWindow = new BrowserWindow({
    width: 190,
    height: 105,
    x: width - 190, // Top right corner
    y: 0, // Top right corner
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    roundedCorners: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  persistentWindow.loadFile(path.join(__dirname, 'windows', 'persistent.html'));
}


//function for checking when highlight has happened
function highlightChecker() {
  // run bash script 
  const highlight_checker_path = path.join(__dirname, 'scripts/highlight-check.sh')
  highlight_checker_process = exec(`bash ${highlight_checker_path}`);

  // monitor bash script outputs
  highlight_checker_process.stdout.on('data', (data) => {
    const output = data.trim().split(' @huh@ ');
    console.log(output)
    word = output[0]
  });

  highlight_checker_process.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  
  highlight_checker_process.on('close', (code) => {
    console.log(`highlight_checker_process exited with code ${code}`);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  
  createMainWindow()

});

ipcMain.on('toggle-highlight', (event, arg) => {
  if (arg == 'on') {
    createPersistentWindow()
    highlightChecker()
  } else if (arg == 'off') {
    if (!persistentWindow.isDestroyed()) {
      persistentWindow.close();
    }
    if (highlight_checker_process) {
      highlight_checker_process.kill();
    }
  }
});


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
