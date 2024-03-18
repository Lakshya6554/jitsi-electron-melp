const { contextBridge, ipcRenderer } = require('electron');
const { RemoteControl,
    setupScreenSharingRender,
    setupAlwaysOnTopRender,
    initPopupsConfigurationRender,
    setupPowerMonitorRender
} = require('@jitsi/electron-sdk');
// ipcRenderer.
const whitelistedIpcChannels = ['protocol-data-msg', 'renderer-ready'];

// const ElectronStore = require('electron-store');
// ElectronStore.initRenderer();
//const store = new electronStore();

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
    // Expose a function to receive the melpCallInst object from the renderer process
    setMelpCallInstance: (melpCallInst) => {
        console.log(`contextBridge called ${JSON.stringify(melpCallInst)}`)
        window.melpCallInst = melpCallInst;
    }
});


/**
 * Setup the renderer process.
 *
 * @param {*} api - API object.
 * @param {*} options - Options for what to enable.
 * @returns {void}
 */
function setupRenderer(api, options = {}) {
    initPopupsConfigurationRender(api);

    const iframe = api.getIFrame();

    setupScreenSharingRender(api);

    if (options.enableRemoteControl) {
        new RemoteControl(iframe); // eslint-disable-line no-new
    }
    console.log(api)

    // Allow window to be on top if enabled in settings
    if (options.enableAlwaysOnTopWindow) {
        setupAlwaysOnTopRender(api, null, { showOnPrejoin: true });
    }

    setupPowerMonitorRender(api);
}


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