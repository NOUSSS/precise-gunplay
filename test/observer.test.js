require('./helpers/electron-stub');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Services } = require('../src/services');
const { Stats } = require('../src/stats');

function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pg-test-'));
  const client = { puuid: 'moi' };
  const assets = { currentAct: () => null, map: () => null };
  const services = new Services(client, assets, dir);
  const stats = new Stats(client, assets, services, dir);
  services.stats = stats;
  return { services, stats };
}

// Match à deux équipes ; « moi » y est joueur ou observateur.
const match = (observer) => ({
  matchInfo: { matchId: 'm1', mapId: '/Game/Maps/Essai', queueID: '', gameStartMillis: 1, gameLengthMillis: 2 },
  players: [
    { subject: 'moi', teamId: 'Blue', characterId: 'AGENT-A', isObserver: observer, stats: { kills: 5, deaths: 3, assists: 1, score: 900, roundsPlayed: 18 } },
    { subject: 'allié', teamId: 'Blue', characterId: 'AGENT-B', stats: { kills: 9, deaths: 7, assists: 2, score: 1500, roundsPlayed: 18 } },
    { subject: 'adversaire', teamId: 'Red', characterId: 'AGENT-C', stats: { kills: 7, deaths: 9, assists: 0, score: 1200, roundsPlayed: 18 } },
  ],
  teams: [{ teamId: 'Blue', won: true, roundsWon: 13 }, { teamId: 'Red', won: false, roundsWon: 5 }],
  roundResults: [],
});

test('joueur normal : le match est résumé', () => {
  const { services, stats } = setup();
  assert.equal(stats.record(match(false), 'moi').result, 'win');
  const summary = services.summarizeMatch(match(false));
  assert.equal(summary.id, 'm1');
  assert.equal(summary.kills, 5);
});

test('observateur : pas de résumé, pas d’exception', () => {
  const { services, stats } = setup();
  assert.equal(stats.record(match(true), 'moi'), null);
  assert.equal(services.summarizeMatch(match(true)), null);
});

test('un match sans résumé n’est pas redemandé pendant la session', () => {
  const { stats } = setup();
  assert.equal(stats.hasMatch('moi', 'm1'), false);
  stats.skipped.add('moi:m1');
  assert.equal(stats.hasMatch('moi', 'm1'), true);
});
