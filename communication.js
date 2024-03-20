import { IpcRenderer } from "electron";
// Import communication functions from preload.js
const { sendToMain, receiveFromMain, exampleFunction } = window.preloadAPI;

exampleFunction();

// Example usage of sending data to main.js
sendToMain('preload-data', { message: 'Hello from communication.js to preload.js!' });

// Example usage of receiving data from main.js
receiveFromMain('main-data', (data) => {
    console.log('Received data in communication.js:', data);
});

module.exports = {
    sendToMain,
    receiveFromMain
};
