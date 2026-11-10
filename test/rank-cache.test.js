require('./helpers/electron-stub');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Services } = require('../src/services');

const MMR = { QueueSkills: { competitive: { SeasonalInfoBySeasonID: { act1: { CompetitiveTier: 21, RankedRating: 40 } } } } };

function setup() {
  const state = { fail: false };
  const client = { puuid: 'moi', getMMR: async () => { if (state.fail) throw new Error('refus'); return MMR; } };
  const assets = { currentAct: () => ({ uuid: 'act1' }), map: () => null };
  const services = new Services(client, assets, fs.mkdtempSync(path.join(os.tmpdir(), 'pg-test-')));
  // Fait expirer l'entrée du cache pour forcer une nouvelle requête.
  const expire = (puuid) => { services.rankCache.get(puuid).at = 0; };
  return { state, services, expire };
}

test('un échec après un succès garde le dernier rang connu', async () => {
  const { state, services, expire } = setup();
  assert.equal((await services.rank('p')).tier, 21);
  state.fail = true;
  expire('p');
  assert.equal((await services.rank('p')).tier, 21);
  assert.equal((await services.rankSoon('p')).tier, 21);
  assert.equal(services.rankNow('p', 'match').tier, 21);
});

test('un échec sans rang connu ne présente pas le joueur comme non classé en partie', async () => {
  const { state, services } = setup();
  state.fail = true;
  await services.rank('p');
  assert.equal(services.rankNow('p', 'match'), null);
});

test('une réponse valide après un échec remplace la valeur', async () => {
  const { state, services, expire } = setup();
  state.fail = true;
  await services.rank('p');
  state.fail = false;
  expire('p');
  assert.equal((await services.rank('p')).tier, 21);
  assert.equal(services.rankNow('p', 'match').tier, 21);
});
