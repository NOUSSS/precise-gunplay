const test = require('node:test');
const assert = require('node:assert/strict');
const { connectionWatcher } = require('../src/riot/watch');

// Faux client : « fail » décide du prochain refreshTokens, comme le vrai il oublie ses jetons sur un échec.
function setup() {
  const seen = { lost: [], changed: 0, refreshed: 0 };
  const client = {
    puuid: 'compte-a',
    tokens: { access: 'a', entitlement: 'b' },
    fail: null,
    nextPuuid: 'compte-a',
    async refreshTokens() {
      seen.refreshed++;
      if (this.fail) {
        this.tokens = null;
        throw Object.assign(new Error('échec'), { code: this.fail });
      }
      this.tokens = { access: 'a2', entitlement: 'b2' };
      this.puuid = this.nextPuuid;
    },
  };
  const env = { sameLockfile: true };
  const check = connectionWatcher({
    client,
    lockfileUnchanged: () => env.sameLockfile,
    onLost: (e) => { client.tokens = null; seen.lost.push(e.code); },
    onAccountChanged: () => { seen.changed++; },
  });
  return { client, env, seen, check };
}

test('vérification réussie : rien ne change', async () => {
  const { client, seen, check } = setup();
  assert.equal(await check(), 'ok');
  assert.ok(client.tokens);
  assert.deepEqual(seen.lost, []);
});

test('deux vérifications ratées sont tolérées, la troisième coupe', async () => {
  const { client, seen, check } = setup();
  client.fail = 'RIOT_CLIENT_CLOSED';
  assert.equal(await check(), 'missed');
  assert.ok(client.tokens, 'les jetons sont gardés pendant la tolérance');
  assert.equal(await check(), 'missed');
  assert.ok(client.tokens);
  assert.equal(await check(), 'lost');
  assert.deepEqual(seen.lost, ['RIOT_CLIENT_CLOSED']);
});

test('une réussite remet le compte des ratés à zéro', async () => {
  const { client, seen, check } = setup();
  client.fail = 'RIOT_CLIENT_CLOSED';
  assert.equal(await check(), 'missed');
  assert.equal(await check(), 'missed');
  client.fail = null;
  assert.equal(await check(), 'ok');
  client.fail = 'RIOT_CLIENT_CLOSED';
  assert.equal(await check(), 'missed');
  assert.equal(await check(), 'missed');
  assert.deepEqual(seen.lost, []);
});

test('compte déconnecté du Riot Client : coupure immédiate', async () => {
  const { client, seen, check } = setup();
  client.fail = 'NOT_LOGGED_IN';
  assert.equal(await check(), 'lost');
  assert.deepEqual(seen.lost, ['NOT_LOGGED_IN']);
});

test('fichier de verrou absent ou changé : coupure immédiate, sans requête', async () => {
  const { env, seen, check } = setup();
  env.sameLockfile = false;
  assert.equal(await check(), 'lost');
  assert.deepEqual(seen.lost, ['RIOT_CLIENT_CLOSED']);
  assert.equal(seen.refreshed, 0);
});

test('autre compte : signalé', async () => {
  const { client, seen, check } = setup();
  client.nextPuuid = 'compte-b';
  assert.equal(await check(), 'changed');
  assert.equal(seen.changed, 1);
  assert.deepEqual(seen.lost, []);
});
