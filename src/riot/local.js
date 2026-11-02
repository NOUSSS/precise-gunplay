// Accès à l'API locale du Riot Client (via le lockfile). Aucun mot de passe n'est jamais demandé :
// le Riot Client déjà connecté nous fournit les jetons d'accès.
const fs = require('fs');
const path = require('path');
const https = require('https');

const LOCALAPPDATA = process.env.LOCALAPPDATA || '';
const LOCKFILE = path.join(LOCALAPPDATA, 'Riot Games', 'Riot Client', 'Config', 'lockfile');
const SHOOTER_LOG = path.join(LOCALAPPDATA, 'VALORANT', 'Saved', 'Logs', 'ShooterGame.log');

// Le Riot Client utilise un certificat auto-signé sur 127.0.0.1. Connexions gardées ouvertes : sans elles,
// chaque requête (plusieurs par minute) refait une poignée de main TLS complète.
const agent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });

function readLockfile() {
  try {
    const [name, pid, port, password, protocol] = fs.readFileSync(LOCKFILE, 'utf8').trim().split(':');
    if (!port || !password) return null;
    return { name, pid, port: Number(port), password, protocol };
  } catch {
    return null;
  }
}

function readShooterLog() {
  try {
    return fs.readFileSync(SHOOTER_LOG, 'utf8');
  } catch {
    return '';
  }
}

function localRequest(lock, method, urlPath, body, retry = true) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: '127.0.0.1',
        port: lock.port,
        path: urlPath,
        method,
        agent,
        headers: {
          Authorization: 'Basic ' + Buffer.from(`riot:${lock.password}`).toString('base64'),
          'Content-Type': 'application/json',
        },
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let data = raw;
          try { data = raw ? JSON.parse(raw) : null; } catch { /* texte brut */ }
          if (res.statusCode >= 400) {
            const err = new Error(`API locale ${res.statusCode} sur ${urlPath}`);
            err.status = res.statusCode;
            return reject(err);
          }
          resolve(data);
        });
      }
    );
    req.on('error', (e) => {
      // Connexion gardée ouverte puis fermée par le Riot Client entre deux requêtes : une lecture est
      // retentée une fois sur une nouvelle connexion.
      if (retry && method === 'GET' && req.reusedSocket && e.code === 'ECONNRESET') {
        return resolve(localRequest(lock, method, urlPath, body, false));
      }
      reject(e);
    });
    req.setTimeout(5000, () => req.destroy(new Error('Délai dépassé (API locale)')));
    if (body !== undefined) req.write(JSON.stringify(body));
    req.end();
  });
}

module.exports = { readLockfile, readShooterLog, localRequest, LOCKFILE };
