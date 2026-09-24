const { contextBridge, ipcRenderer } = require('electron');

const EVENTS = new Set(['status', 'autolock-event', 'update']);

contextBridge.exposeInMainWorld('api', {
  call: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  on: (channel, cb) => {
    if (!EVENTS.has(channel)) return () => {};
    const listener = (_e, data) => cb(data);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
});
