require('./helpers/electron-stub');
const test = require('node:test');
const assert = require('node:assert/strict');
const { RiotClient } = require('../src/riot/client');

test('une coupure ne fait pas oublier les pauses demandées par Riot', () => {
  const client = new RiotClient();
  const until = Date.now() + 60000;
  client.rateLimits.set('/mmr', until);
  client.sentLastMinute('/mmr').push(Date.now());
  client.tokens = { access: 'a', entitlement: 'b' };
  client.puuid = 'compte-a';

  client.reset();

  assert.equal(client.connected, false);
  assert.equal(client.puuid, null);
  assert.equal(client.rateLimits.get('/mmr'), until);
  assert.equal(client.sentLastMinute('/mmr').length, 1);
});
