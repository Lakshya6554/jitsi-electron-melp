const { contextBridge, ipcRenderer } = require('electron');
const { RemoteControl,
    setupScreenSharingRender,
    setupAlwaysOnTopRender,
    initPopupsConfigurationRender,
    setupPowerMonitorRender
} = require('@jitsi/electron-sdk');
// ipcRenderer.
const whitelistedIpcChannels = ['protocol-data-msg', 'renderer-ready'];
window.jitsiNodeAPI = {
    openExternalLink,
    setupRenderer,
    ipc: {
        on: (channel, listener) => {
            if (!whitelistedIpcChannels.includes(channel)) {
                return;
            }

            return ipcRenderer.on(channel, listener);
        },
        send: channel => {
            if (!whitelistedIpcChannels.includes(channel)) {
                return;
            }

            return ipcRenderer.send(channel);
        },
        removeListener: (channel, listener) => {
            if (!whitelistedIpcChannels.includes(channel)) {
                return;
            }

            return ipcRenderer.removeListener(channel, listener);
        }
    }
};
function sendToMain(channel, data) {
    ipcRenderer.send(channel, data);
}

// Function to receive data from main.js in preload.js
function receiveFromMain(channel, callback) {
    ipcRenderer.on(channel, (event, data) => {
        callback(data);
    });
}

// Function to demonstrate usage within communication.js
function exampleFunction() {
    console.log("This is an example function in preload.js");
}

// Expose functions to be used in communication.js
window.preloadAPI = {
    sendToMain,
    receiveFromMain,
    exampleFunction
};

/**
 * Open an external URL.
 *
 * @param {string} url - The URL we with to open.
 * @returns {void}
 */
function openExternalLink(url) {
    ipcRenderer.send('jitsi-open-url', url);
}

contextBridge.exposeInMainWorld('electron', {
    openNewWindow: (url, name, size) => {
        console.log('Opening new window...');
        ipcRenderer.send('open-new-window', { url, name, size });
    },
    setuprenderer: (api, options) => {
        console.log(`API - melp instance ${api}`)
        setupRenderer(JSON.parse(api), options);
    },
    hello: () => {
        console.log("HEllo bro from preload.js");
    }
});

window.hello = () => {
    console.log('Hello bro from preload')
}

console.log('====================================');
console.log('Preload loaded');
console.log('====================================');
/**
 * Setup the renderer process.
 *
 * @param {*} api - API object.
 * @param {*} options - Options for what to enable.
 * @returns {void}
 */
function setupRenderer(api, options = {}) {
    let melpCallInst = new JitsiMeetExternalAPI(JITSE_BASE, options);
    initPopupsConfigurationRender(melpCallInst);
    console.log(melpCallInst)
    setupScreenSharingRender(melpCallInst);

    // if (options.enableRemoteControl) {
    //     new RemoteControl(iframe); // eslint-disable-line no-new
    // }
    console.log(api)

    // Allow window to be on top if enabled in settings
    // if (options.enableAlwaysOnTopWindow) {
    //     setupAlwaysOnTopRender(api, null, { showOnPrejoin: true });
    // }

    setupPowerMonitorRender(melpCallInst);
}
contextBridge.exposeInMainWorld('jitsiAPI', {
    getDesktopSources: (options) => ipcRenderer.send('jitsi-screen-sharing-get-sources', options)
})




// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }
    console.log('######1')
    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }

    contextBridge.exposeInMainWorld('electronAPI', {
        localStorage: {
            getItem: (key) => window.localStorage.getItem(key),
            setItem: (key, value) => window.localStorage.setItem(key, value),
            removeItem: (key) => window.localStorage.removeItem(key),
            clear: () => window.localStorage.clear()
        }
    });
})