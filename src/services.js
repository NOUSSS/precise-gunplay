// Logique métier : transforme les réponses brutes de Riot en données prêtes à afficher.
const { CURRENCIES, ITEM_TYPES } = require('./assets');

// Agents gratuits (non listés dans les entitlements).
const FREE_AGENTS = [
  'add6443a-41bd-e414-f6ad-e58d267f4e95', // Jett
  'eb93336a-449b-9c1b-0a54-a891f7921d69', // Phoenix
  '569fdd95-4d10-43ab-ca70-79becc718b46', // Sage
  '320b2a48-4d9b-a075-30f1-1f93a9b638fa', // Sova
  '9f0d8ba9-4140-b941-57d3-a7ad57c6b417', // Brimstone
];

const CURRENCY_IDS = Object.fromEntries(Object.entries(CURRENCIES).map(([id, k]) => [k, id]));

function price(cost) {
  if (!cost) return null;
  const [cur, amount] = Object.entries(cost)[0] || [];
  if (cur === undefined) return null;
  return { currency: CURRENCIES[cur] || 'vp', amount };
}

function decodePresence(p) {
  try {
    return JSON.parse(Buffer.from(p.private || '', 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

class Services {
  constructor(client, assets) {
    this.client = client;
    this.assets = assets;
    this.rankCache = new Map();
    this.matchCache = new Map();
  }

  // ---------- Rangs ----------
  rankFromMMR(mmr) {
    const act = this.assets.currentAct()?.uuid;
    const seasons = mmr?.QueueSkills?.competitive?.SeasonalInfoBySeasonID || {};
    const cur = act ? seasons[act] : null;
    let tier = cur?.CompetitiveTier || 0;
    let rr = cur?.RankedRating || 0;
    const latest = mmr?.LatestCompetitiveUpdate;
    if (!cur && latest && latest.SeasonID === act) {
      tier = latest.TierAfterUpdate || 0;
      rr = latest.RankedRatingAfterUpdate || 0;
    }
    let peak = 0;
    for (const s of Object.values(seasons)) {
      peak = Math.max(peak, s?.CompetitiveTier || 0);
      for (const t of Object.keys(s?.WinsByTier || {})) peak = Math.max(peak, Number(t));
    }
    return { tier, rr, peak, wins: cur?.NumberOfWinsWithPlacements ?? cur?.NumberOfWins ?? 0, games: cur?.NumberOfGames || 0 };
  }

  async rank(puuid) {
    const hit = this.rankCache.get(puuid);
    if (hit && Date.now() - hit.at < 5 * 60 * 1000) return hit.value;
    const mmr = await this.client.getMMR(puuid).catch(() => null);
    const value = this.rankFromMMR(mmr);
    this.rankCache.set(puuid, { at: Date.now(), value });
    return value;
  }

  async names(puuids) {
    const unique = [...new Set(puuids.filter(Boolean))];
    if (!unique.length) return new Map();
    const res = await this.client.getNames(unique).catch(() => []);
    return new Map((res || []).map((n) => [n.Subject, { name: n.GameName, tag: n.TagLine }]));
  }

  // ---------- Profil ----------
  wallet(w) {
    const b = w?.Balances || {};
    return { vp: b[CURRENCY_IDS.vp] || 0, rp: b[CURRENCY_IDS.rp] || 0, kc: b[CURRENCY_IDS.kc] || 0 };
  }

  async profile() {
    const c = this.client;
    const safe = (p) => p.catch(() => null);
    const [names, xp, loadout, wallet, rank] = await Promise.all([
      safe(this.names([c.puuid])),
      safe(c.getAccountXP()),
      safe(c.getLoadout()),
      safe(c.getWallet()),
      safe(this.rank(c.puuid)),
    ]);
    const id = loadout?.Identity || {};
    const card = id.PlayerCardID ? this.assets.cardById.get(id.PlayerCardID.toLowerCase()) : null;
    const title = id.PlayerTitleID ? this.assets.titleById.get(id.PlayerTitleID.toLowerCase()) : null;
    const me = names?.get(c.puuid) || {};
    return {
      puuid: c.puuid,
      name: me.name || 'Joueur',
      tag: me.tag || '',
      region: c.region,
      level: xp?.Progress?.Level ?? id.AccountLevel ?? null,
      card: card ? { wide: card.wide, small: card.small, name: card.name } : null,
      title: title?.name || null,
      rank,
      wallet: this.wallet(wallet),
    };
  }

  // ---------- Boutique ----------
  async store() {
    const [front, wallet] = await Promise.all([this.client.getStorefront(), this.client.getWallet().catch(() => null)]);
    if (!front) throw new Error('Boutique indisponible pour le moment.');
    const now = Date.now();
    const a = this.assets;
    const reward = (offer) => {
      const r = offer?.Rewards?.[0];
      return r ? a.item(r.ItemTypeID, r.ItemID) : { kind: 'Objet', name: 'Objet' };
    };

    const sp = front.SkinsPanelLayout || {};
    const byOffer = new Map((sp.SingleItemStoreOffers || []).map((o) => [o.OfferID, o]));
    const daily = (sp.SingleItemOffers || []).map((id) => {
      const offer = byOffer.get(id);
      return { ...(offer ? reward(offer) : a.item(ITEM_TYPES.skin, id)), price: price(offer?.Cost) };
    });

    const rawBundles = front.FeaturedBundle?.Bundles?.length ? front.FeaturedBundle.Bundles : [front.FeaturedBundle?.Bundle].filter(Boolean);
    const bundles = rawBundles.map((b) => {
      const info = a.bundleById.get(String(b.DataAssetID).toLowerCase());
      const items = (b.Items || []).map((i) => ({
        ...a.item(i.Item?.ItemTypeID, i.Item?.ItemID),
        amount: i.Item?.Amount,
        price: { currency: CURRENCIES[i.CurrencyID] || 'vp', amount: i.DiscountedPrice },
      }));
      const total = price(b.TotalDiscountedCost) || { currency: 'vp', amount: items.reduce((s, i) => s + (i.price.amount || 0), 0) };
      return {
        name: info?.name || 'Pack',
        icon: info?.icon,
        price: total,
        basePrice: price(b.TotalBaseCost),
        endsAt: now + (b.DurationRemainingInSeconds || 0) * 1000,
        items,
      };
    });

    const night = front.BonusStore
      ? {
          endsAt: now + (front.BonusStore.BonusStoreRemainingDurationInSeconds || 0) * 1000,
          offers: (front.BonusStore.BonusStoreOffers || []).map((o) => ({
            ...reward(o.Offer),
            price: price(o.Offer?.Cost),
            discounted: price(o.DiscountCosts),
            percent: o.DiscountPercent,
            seen: o.IsSeen,
          })),
        }
      : null;

    const acc = front.AccessoryStore;
    const accessories = acc
      ? {
          endsAt: now + (acc.AccessoryStoreRemainingDurationInSeconds || 0) * 1000,
          offers: (acc.AccessoryStoreOffers || []).map((o) => ({ ...reward(o.Offer), price: price(o.Offer?.Cost) })),
        }
      : null;

    return {
      wallet: this.wallet(wallet),
      daily,
      dailyEndsAt: now + (sp.SingleItemOffersRemainingDurationInSeconds || 0) * 1000,
      bundles,
      night,
      accessories,
    };
  }

  // ---------- Collection ----------
  async ownedAgents() {
    const res = await this.client.getEntitlements('agent').catch(() => null);
    const ids = (res?.Entitlements || []).map((e) => e.ItemID.toLowerCase());
    return [...new Set([...FREE_AGENTS, ...ids])];
  }

  async collection() {
    const res = await this.client.getEntitlements('skin');
    const seen = new Map();
    for (const e of res?.Entitlements || []) {
      const skin = this.assets.skinByLevel.get(String(e.ItemID).toLowerCase());
      if (!skin || seen.has(skin.uuid)) continue;
      const tier = this.assets.tierByUuid.get(String(skin.tier).toLowerCase());
      seen.set(skin.uuid, { name: skin.name, icon: skin.icon, color: tier?.color, tierIcon: tier?.icon, tierRank: tier?.rank ?? -1 });
    }
    return [...seen.values()].sort((x, y) => y.tierRank - x.tierRank || x.name.localeCompare(y.name, 'fr'));
  }

  // ---------- Partie en direct ----------
  async decorate(players, partyMembers = new Set()) {
    const names = await this.names(players.map((p) => p.puuid));
    const ranks = await Promise.all(players.map((p) => this.rank(p.puuid)));
    return players.map((p, i) => {
      const n = names.get(p.puuid) || {};
      const isMe = p.puuid === this.client.puuid;
      const hidden = !isMe && !partyMembers.has(p.puuid) && p.identity?.Incognito;
      const agent = p.agent ? this.assets.agentById.get(String(p.agent).toLowerCase()) : null;
      return {
        puuid: p.puuid,
        isMe,
        name: hidden ? agent?.name || 'Joueur masqué' : n.name || '???',
        tag: hidden ? '' : n.tag || '',
        hidden,
        level: p.identity?.HideAccountLevel && !isMe ? null : p.identity?.AccountLevel ?? null,
        agentId: agent?.uuid || null,
        state: p.state || null,
        rank: ranks[i],
      };
    });
  }

  async partyMemberSet() {
    try {
      const pp = await this.client.getPartyPlayer();
      if (!pp?.CurrentPartyID) return new Set();
      const party = await this.client.getParty(pp.CurrentPartyID);
      return new Set((party?.Members || []).map((m) => m.Subject));
    } catch {
      return new Set();
    }
  }

  async live() {
    const c = this.client;
    const pre = await c.getPregamePlayer().catch(() => null);
    if (pre?.MatchID) {
      const m = await c.getPregameMatch(pre.MatchID);
      if (m) {
        const party = await this.partyMemberSet();
        const allies = await this.decorate(
          (m.AllyTeam?.Players || []).map((p) => ({ puuid: p.Subject, agent: p.CharacterID, state: p.CharacterSelectionState, identity: p.PlayerIdentity })),
          party
        );
        return {
          state: 'pregame',
          matchId: m.ID,
          map: this.assets.map(m.MapID),
          queue: m.QueueID,
          endsAt: Date.now() + (m.PhaseTimeRemainingNS || 0) / 1e6,
          allies,
          enemies: [],
        };
      }
    }
    const core = await c.getCoregamePlayer().catch(() => null);
    if (core?.MatchID) {
      const m = await c.getCoregameMatch(core.MatchID);
      if (m) {
        const party = await this.partyMemberSet();
        const myTeam = (m.Players || []).find((p) => p.Subject === c.puuid)?.TeamID;
        const all = await this.decorate(
          (m.Players || []).map((p) => ({ puuid: p.Subject, agent: p.CharacterID, identity: p.PlayerIdentity, team: p.TeamID })),
          party
        );
        const teamOf = new Map((m.Players || []).map((p) => [p.Subject, p.TeamID]));
        return {
          state: 'ingame',
          matchId: m.MatchID,
          map: this.assets.map(m.MapID),
          queue: m.MatchmakingData?.QueueID || null,
          allies: all.filter((p) => teamOf.get(p.puuid) === myTeam),
          enemies: all.filter((p) => teamOf.get(p.puuid) !== myTeam),
        };
      }
    }
    return { state: 'idle' };
  }

  // ---------- Historique ----------
  async matchDetails(id) {
    if (this.matchCache.has(id)) return this.matchCache.get(id);
    const d = await this.client.getMatchDetails(id);
    if (d) this.matchCache.set(id, d);
    return d;
  }

  summarizeMatch(d) {
    const me = d.players?.find((p) => p.subject === this.client.puuid);
    if (!me) return null;
    const teams = d.teams || [];
    const myTeam = teams.find((t) => t.teamId === me.teamId);
    const other = teams.find((t) => t.teamId !== me.teamId);
    const rounds = me.stats?.roundsPlayed || d.roundResults?.length || 1;
    let result = 'loss';
    if (myTeam?.won) result = 'win';
    else if (myTeam && other && !other.won && myTeam.roundsWon === other.roundsWon) result = 'draw';
    const scoreboard = (d.players || [])
      .map((p) => ({
        name: p.gameName,
        tag: p.tagLine,
        agentId: p.characterId?.toLowerCase(),
        team: p.teamId === me.teamId ? 'ally' : 'enemy',
        kills: p.stats?.kills || 0,
        deaths: p.stats?.deaths || 0,
        assists: p.stats?.assists || 0,
        acs: Math.round((p.stats?.score || 0) / (p.stats?.roundsPlayed || rounds)),
        tier: p.competitiveTier || 0,
        isMe: p.subject === this.client.puuid,
      }))
      .sort((x, y) => y.acs - x.acs);
    return {
      id: d.matchInfo?.matchId,
      map: this.assets.map(d.matchInfo?.mapId),
      queue: d.matchInfo?.queueID || d.matchInfo?.queueId || '',
      startedAt: d.matchInfo?.gameStartMillis,
      lengthMs: d.matchInfo?.gameLengthMillis,
      agentId: me.characterId?.toLowerCase(),
      kills: me.stats?.kills || 0,
      deaths: me.stats?.deaths || 0,
      assists: me.stats?.assists || 0,
      acs: Math.round((me.stats?.score || 0) / rounds),
      tier: me.competitiveTier || 0,
      result,
      score: myTeam && other ? [myTeam.roundsWon, other.roundsWon] : null,
      scoreboard,
    };
  }

  async history(queue) {
    const h = await this.client.getMatchHistory(0, 15, queue);
    const list = h?.History || [];
    const details = await Promise.all(list.map((m) => this.matchDetails(m.MatchID).catch(() => null)));
    return details.filter(Boolean).map((d) => this.summarizeMatch(d)).filter(Boolean);
  }

  // ---------- Groupe ----------
  async party() {
    const pp = await this.client.getPartyPlayer();
    if (!pp?.CurrentPartyID) return null;
    const p = await this.client.getParty(pp.CurrentPartyID);
    if (!p) return null;
    const members = p.Members || [];
    const names = await this.names(members.map((m) => m.Subject));
    const ranks = await Promise.all(members.map((m) => this.rank(m.Subject)));
    const me = members.find((m) => m.Subject === this.client.puuid);
    return {
      id: p.ID,
      state: p.State,
      open: p.Accessibility === 'OPEN',
      queue: p.MatchmakingData?.QueueID || '',
      eligibleQueues: p.EligibleQueues || [],
      isOwner: !!me?.IsOwner,
      queueEntryTime: p.QueueEntryTime,
      members: members.map((m, i) => {
        const card = m.PlayerIdentity?.PlayerCardID ? this.assets.cardById.get(m.PlayerIdentity.PlayerCardID.toLowerCase()) : null;
        const n = names.get(m.Subject) || {};
        return {
          puuid: m.Subject,
          name: n.name || '???',
          tag: n.tag || '',
          owner: !!m.IsOwner,
          ready: !!m.IsReady,
          level: m.PlayerIdentity?.AccountLevel ?? null,
          card: card?.small || null,
          rank: ranks[i],
          isMe: m.Subject === this.client.puuid,
        };
      }),
    };
  }

  // ---------- Amis ----------
  async friends() {
    const [fr, pr] = await Promise.all([this.client.getFriends(), this.client.getPresences().catch(() => null)]);
    const presences = new Map();
    for (const p of pr?.presences || []) {
      if (p.puuid === this.client.puuid) continue;
      const prev = presences.get(p.puuid);
      if (!prev || p.product === 'valorant') presences.set(p.puuid, p);
    }
    const list = (fr?.friends || []).map((f) => {
      const p = presences.get(f.puuid);
      const d = p?.product === 'valorant' ? decodePresence(p) : null;
      const match = d?.matchPresenceData || {};
      const party = d?.partyPresenceData || {};
      const player = d?.playerPresenceData || {};
      const loop = d?.sessionLoopState || match.sessionLoopState || null;
      return {
        puuid: f.puuid,
        name: f.game_name || p?.game_name || '???',
        tag: f.game_tag || p?.game_tag || '',
        note: f.note || '',
        online: !!p && p.state !== 'offline',
        status: p?.state || 'offline', // chat | away | dnd | mobile
        product: p?.product || null,
        valorant: d
          ? {
              loop, // MENUS | PREGAME | INGAME
              queue: d.queueId || match.queueId || '',
              map: this.assets.map(d.matchMap || match.matchMap)?.name || null,
              partySize: d.partySize || party.partySize || 1,
              level: d.accountLevel || player.accountLevel || null,
              tier: d.competitiveTier ?? player.competitiveTier ?? 0,
              score:
                (d.partyOwnerMatchScoreAllyTeam ?? party.partyOwnerMatchScoreAllyTeam) != null
                  ? [d.partyOwnerMatchScoreAllyTeam ?? party.partyOwnerMatchScoreAllyTeam, d.partyOwnerMatchScoreEnemyTeam ?? party.partyOwnerMatchScoreEnemyTeam]
                  : null,
              idle: !!(d.isIdle ?? player.isIdle),
            }
          : null,
      };
    });
    const weight = (f) => (!f.online ? 3 : f.valorant?.loop === 'INGAME' || f.valorant?.loop === 'PREGAME' ? 0 : f.valorant ? 1 : 2);
    return list.sort((a, b) => weight(a) - weight(b) || a.name.localeCompare(b.name, 'fr'));
  }
}

module.exports = { Services };
