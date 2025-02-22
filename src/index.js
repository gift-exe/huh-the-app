const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('node:path');
const { exec } = require('child_process');
const terminate = require('terminate')


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let persistentWindow;
let highlight_checker_process;

function hasWhiteSpace(s) {
  return /\s/g.test(s);
}

function startApi(){
  // this function is to send a request to restart the render app, 
  // because render shuts down api after being inactive for a while
  // because I'm using the free tier

  url="https://dictionary-api-nmwj.onrender.com/"

  fetch(`${url}define/start`)
    .then(response => response.json())
    .then(data => {
      console.log('API RE-STARTED')
    })
    .catch(error => {
        console.error('Error:', error);

    });
}

function createMainWindow() {
  const { x, y, width, height } = screen.getPrimaryDisplay().workArea;
  mainWindow = new BrowserWindow({
    width:500,
    height:250,
    x: x + (width - 500) / 2,
    y: y + (height - 250) / 2,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'))
  startApi()
}

function createPersistentWindow() {

  const { x, y, width, height } = screen.getPrimaryDisplay().workArea;

  persistentWindow = new BrowserWindow({
    width: 190,
    height: 105,
    x: x + (width - 190), // Top right corner
    y: y + 0, // Top right corner
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

  // persistentWindow.webContents.on('did-finish-load', () => {
  //   persistentWindow.webContents.openDevTools({ mode: 'detach' });
  // });

  ipcMain.on('reload-window', () => {
    //persistentWindow.setBounds({ width: 190, height: 105, x: x + (width - 190), y: y + 0, })
    if (persistentWindow) {
      persistentWindow.webContents.reload();      
    }
  });
}


//function for checking when highlight has happened
function highlightChecker() {
  // run bash script 
  const highlight_checker_path = path.join(__dirname, 'scripts/highlight-check.sh')
  highlight_checker_process = exec(`bash ${highlight_checker_path}`);

  // monitor bash script outputs
  highlight_checker_process.stdout.on('data', (data) => {
    const output = data.trim().split('@huh@');
    text = output[0]
    text = text.trim()

    if (!hasWhiteSpace(text)){ // dont send highlight of multiple words
      console.log(`this word does not have white space: ${text}`)
      persistentWindow.webContents.send('highlighted-text', text);
    }
    else{
      console.log(`this word has white space: ${text}`)
    }
  
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
    mainWindow.minimize()
  } else if (arg == 'off') {
    terminate(highlight_checker_process.pid, err => console.log(err))
    if (!persistentWindow.isDestroyed()) {
      persistentWindow.close();
    }
    
  }
});

ipcMain.on('highlighted-text', (event, text) => {
  if (persistentWindow) {
    persistentWindow.webContents.send('highlighted-text', text);
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
