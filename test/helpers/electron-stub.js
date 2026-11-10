// Les modules de src/ qui font require('electron') se chargent ainsi sous Node seul, sans node_modules.
// À requérir en première ligne d'un test, avant tout module de src/.
const Module = require('module');
const os = require('os');

const electron = {
  app: { getVersion: () => '0.0.0', getPath: () => os.tmpdir(), isPackaged: false },
  nativeImage: {},
  globalShortcut: { register: () => true, unregister: () => {} },
  shell: { openExternal: () => {} },
  BrowserWindow: { getAllWindows: () => [] },
};

const load = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'electron') return electron;
  return load.call(this, request, ...rest);
};

module.exports = electron;
