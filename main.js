// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

// import { app, BrowserWindow } from "electron";
// import path from "path";
// import { setupScreenSharingMain } from "@jitsi/electron-sdk";

const electronStore = require('electron-store');
electronStore.initRenderer();
const store = new electronStore();
let melpCalllInst , Options;
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1366,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Allow accessing local resources
      allowRunningInsecureContent: true, // Allow running insecure content
      webgl: true, // Enable WebGL rendering
      nodeIntegration: true,
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('./src/index.html')
  // mainWindow.loadURL('https://meetstaging.melp.us');

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}
const url = require('url');

// let childWindow = null;

app.commandLine.appendSwitch('enable-features', 'DesktopCapture');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('disable-site-isolation-trials')

ipcMain.on('electron-store-get-data', (event, key) => {
  // Retrieve data from the Electron Store based on the key
  const data = store.get(key);

  // Send the retrieved data back to the renderer process
  event.returnValue = data;
});
ipcMain.on('open-new-window', (event, args) => {
  // openNewWindow(args.url, args.name, args.size);
  let newWindow = new BrowserWindow({
    width: args.size.width, height: args.size.height, webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Allow accessing local resources
      allowRunningInsecureContent: true, // Allow running insecure content
      webgl: true, // Enable WebGL rendering
      nodeIntegration: true,
    }
  });
  newWindow.loadURL(path.join(__dirname, `./src/${args.url}`));
  newWindow.on('closed', () => {
    newWindow = null;
  });
  newWindow.webContents.on('did-finish-load', () => {
    newWindow.webContents.send('initialize-electron', { melpCalllInst , Options });
  });
});
ipcMain.on('melpCallInst', (event, melpCallInst) => {
    melpCalllInst =  melpCallInst;
    console.log(`Melpcall instance in main.js ${melpCallInst}`);
});
ipcMain.on('options', (event, options) => {
  Options =  options;
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  // if (mainWindow) {
  //     const basePath = isDev ? __dirname : app.getAppPath();

  //     // URL for index.html which will be our entry point.
  //     const indexURL = URL.format({
  //         pathname: path.resolve(basePath, './build/index.html'),
  //         protocol: 'file:',
  //         slashes: true
  //     });
  //     mainWindow.webContents.on('will-navigate', (event, url) => {
  //         // log.info(`Navigating to URL: ${url}`)
  //         if (url.indexOf('jwt') > 0) {
  //             localStorage.setItem('meeting_url', `${url}&`);
  //             mainWindow.setMenu(null);
  //             mainWindow.loadURL(indexURL);
  //         }
  //     })
  // }


  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.