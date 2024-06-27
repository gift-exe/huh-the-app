const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const { exec } = require('child_process');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let popup;

//function for creating popup window after highlighting has happened
function createPopupWindow(x, y, word) {
  if (popup) {
    popup.close();
  }

  popup = new BrowserWindow({
    width: 200,
    height: 100,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  popup.loadURL(`data:text/html,
    <html>
      <body style="margin:0; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 10px; border-radius: 5px;">
          ${word}
        </div>
      </body>
    </html>`);

  popup.setPosition(x, y);
  popup.show();
}

//function for checking when highlight has happened
function monitorClipboard() {
  // run bash script 
  const highlight_checker = path.join(__dirname, 'scripts/highlight-check.sh')
  const child = exec(`bash ${highlight_checker}`);

  // monitor bash script outputs
  child.stdout.on('data', (data) => {
    const output = data.trim().split(' @huh@ ');
    console.log(output)
    word = output[0]
    const coords = output[1];
    const x = parseInt(coords.split('x:')[1].split(' ')[0], 10);
    const y = parseInt(coords.split('y:')[1], 10);
    
    createPopupWindow(x, y, word)
  });

  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  
  child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}



const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  //createWindow();
  monitorClipboard();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // app.on('activate', () => {
  //   if (BrowserWindow.getAllWindows().length === 0) {
  //     createWindow();
  //   }
  // });
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
