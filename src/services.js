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

// Rounds par mi-temps des modes avec attaque / défense, par dossier du mode de jeu
// (« /Game/GameModes/Bomb/BombGameMode.BombGameMode_C ») : vaut aussi pour les parties personnalisées.
const HALF_ROUNDS = { Bomb: 12, QuickBomb: 3, Swiftplay_EndOfRoundCredits: 4, OneForAll: 4 };
const halfRounds = (modeId) => HALF_ROUNDS[/\/GameModes\/(?:_Development\/)?([^/]+)\//.exec(modeId || '')?.[1]] || null;

// Groupes de 2 joueurs ou plus : `party` = n° du groupe dans son équipe (Groupe 1, 2…),
// `partyIdx` = n° unique dans la partie, qui donne sa couleur. Ton groupe d'abord (toujours la même
// couleur d'un match à l'autre), puis les autres dans l'ordre d'affichage.
function labelParties(players, partyOf, teamOf) {
  const sizes = new Map();
  for (const p of players) if (partyOf(p)) sizes.set(partyOf(p), (sizes.get(partyOf(p)) || 0) + 1);
  const labels = new Map();
  const perTeam = new Map();
  for (const p of [...players].sort((x, y) => y.isMe - x.isMe)) {
    const id = partyOf(p);
    p.party = null;
    if (!id || sizes.get(id) < 2) continue;
    if (!labels.has(id)) {
      const n = (perTeam.get(teamOf(p)) || 0) + 1;
      perTeam.set(teamOf(p), n);
      labels.set(id, { n, idx: labels.size });
    }
    p.party = labels.get(id).n;
    p.partyIdx = labels.get(id).idx;
  }
}

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

/** Notre propre présence VALORANT, décodée (null si absente). */
function myPresence(pr, puuid) {
  const p = (pr?.presences || []).find((x) => x.puuid === puuid && x.product === 'valorant');
  return (p && decodePresence(p)) || null;
}

class Services {
  constructor(client, assets) {
    this.client = client;
    this.assets = assets;
    this.rankCache = new Map();
    this.rankPending = new Map();
    this.matchCache = new Map();
    this.matchPending = new Map();
    this.recent = new Map(); // stats récentes des joueurs croisés en partie
    this.records = new Map(); // résumé de chaque joueur d'un match téléchargé (« puuid:matchId »)
    this.detailTasks = []; // téléchargements de matchs pour ces stats
    this.detailRunning = 0;
    this.detailSeq = 0;
    this.liveMatchId = null; // partie affichée : seuls ses joueurs sont servis par la file
    this.stats = null; // branché par main.js (calcul des résumés de match)
    this.liveScore = null; // dernier score lu pour la partie en cours { matchId, score }
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
    if (hit && Date.now() - hit.at < (hit.failed ? 30 * 1000 : 5 * 60 * 1000)) return hit.value;
    if (!this.rankPending.has(puuid)) {
      // Refus de Riot (exception) : réessayé ; pas de MMR (404, null) : « Non classé ».
      const load = this.client.getMMR(puuid).then(
        (mmr) => ({ mmr, failed: false }),
        () => ({ mmr: null, failed: true })
      ).then(({ mmr, failed }) => {
        const value = this.rankFromMMR(mmr);
        this.rankCache.set(puuid, { at: Date.now(), value, failed });
        return value;
      });
      this.rankPending.set(puuid, load.finally(() => this.rankPending.delete(puuid)));
    }
    return this.rankPending.get(puuid);
  }

  /**
   * Rang en cache (même périmé), sinon null : chargé en arrière-plan, la page n'attend pas la limite de Riot.
   * Un rang ne change pas pendant une partie : lu une fois par match.
   */
  rankNow(puuid, matchId) {
    const hit = this.rankCache.get(puuid);
    const age = hit ? Date.now() - hit.at : Infinity;
    if (hit?.failed) {
      if (age >= 30 * 1000) this.rank(puuid); // refusé par Riot : nouvel essai, sans afficher « Non classé »
      return null;
    }
    if (hit && (hit.matchId === matchId || age < 5 * 60 * 1000)) hit.matchId = matchId;
    else this.rank(puuid).then(() => (this.rankCache.get(puuid).matchId = matchId));
    return hit?.value ?? null;
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
    // Skin équipé sur chaque arme (armes favorites de l'accueil).
    const skins = {};
    for (const g of loadout?.Guns || []) {
      const s = g.SkinID && this.assets.skinById.get(String(g.SkinID).toLowerCase());
      if (s?.icon) skins[String(g.ID).toLowerCase()] = s.icon;
    }
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
      skins,
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
  async decorate(players, partyMembers, queue, matchId) {
    this.liveMatchId = matchId;
    // Stats lancées avant les rangs, qui partagent une limite de Riot plus basse avec l'historique RR.
    for (const p of players) this.recentStats(p.puuid, queue, matchId);
    const names = await this.namesCached(players.map((p) => p.puuid));
    const ranks = players.map((p) => this.rankNow(p.puuid, matchId));
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
        recent: this.recentStats(p.puuid, queue, matchId),
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

  /**
   * Côté joué (attaque / défense) pour le score [nous, eux] donné. Red attaque en première mi-temps.
   * null hors modes à côtés, match terminé, et en prolongation / round décisif (ordre des côtés non vérifié).
   */
  sideAt(teamId, modeId, score = [0, 0]) {
    const half = halfRounds(modeId);
    if (!half || (teamId !== 'Red' && teamId !== 'Blue')) return null;
    const round = score[0] + score[1];
    if (Math.max(...score) > half || round >= 2 * half) return null;
    return (teamId === 'Red') === (round < half) ? 'attack' : 'defense';
  }

  /**
   * Groupe de chaque joueur de la partie (puuid → id de groupe), lu dans les présences : le client
   * reçoit celles de tous les joueurs de la partie. Ton groupe vient aussi de l'API des groupes.
   */
  matchParties(pr, myParty = new Set()) {
    const parties = new Map();
    for (const p of pr?.presences || []) {
      if (p.product !== 'valorant') continue;
      const d = decodePresence(p);
      const id = d?.partyId || d?.partyPresenceData?.partyId;
      if (id) parties.set(p.puuid, id);
    }
    const mine = parties.get(this.client.puuid) || 'mine';
    for (const id of myParty) parties.set(id, mine);
    return parties;
  }

  /** Score de la partie en cours [nous, eux], lu dans notre propre présence (mise à jour à chaque round). */
  myMatchScore(pr) {
    const d = myPresence(pr, this.client.puuid);
    if (!d) return null;
    const party = d.partyPresenceData || {};
    const ally = d.partyOwnerMatchScoreAllyTeam ?? party.partyOwnerMatchScoreAllyTeam;
    const enemy = d.partyOwnerMatchScoreEnemyTeam ?? party.partyOwnerMatchScoreEnemyTeam;
    return ally != null && enemy != null ? [ally, enemy] : null;
  }

  async live() {
    const c = this.client;
    const pre = await c.getPregamePlayer().catch(() => null);
    if (pre?.MatchID) {
      const m = await c.getPregameMatch(pre.MatchID);
      if (m) {
        const [party, pr] = await Promise.all([this.partyMemberSet(), c.getPresences().catch(() => null)]);
        const allies = await this.decorate(
          (m.AllyTeam?.Players || []).map((p) => ({ puuid: p.Subject, agent: p.CharacterID, state: p.CharacterSelectionState, identity: p.PlayerIdentity })),
          party,
          m.QueueID,
          m.ID
        );
        const parties = this.matchParties(pr, party);
        labelParties(allies, (p) => parties.get(p.puuid), () => 'ally');
        return {
          state: 'pregame',
          matchId: m.ID,
          map: this.assets.map(m.MapID),
          queue: m.QueueID,
          endsAt: Date.now() + (m.PhaseTimeRemainingNS || 0) / 1e6,
          side: this.sideAt(m.AllyTeam?.TeamID, m.Mode),
          allies,
          enemies: [],
        };
      }
    }
    const core = await c.getCoregamePlayer().catch(() => null);
    if (core?.MatchID) {
      const m = await c.getCoregameMatch(core.MatchID);
      if (m) {
        const [party, pr] = await Promise.all([this.partyMemberSet(), c.getPresences().catch(() => null)]);
        const myTeam = (m.Players || []).find((p) => p.Subject === c.puuid)?.TeamID;
        // Ton équipe d'abord : ses stats sont chargées en premier.
        const all = await this.decorate(
          [...(m.Players || [])].sort((x, y) => (y.TeamID === myTeam) - (x.TeamID === myTeam)).map((p) => ({ puuid: p.Subject, agent: p.CharacterID, identity: p.PlayerIdentity, team: p.TeamID })),
          party,
          m.MatchmakingData?.QueueID,
          m.MatchID
        );
        const teamOf = new Map((m.Players || []).map((p) => [p.Subject, p.TeamID]));
        const prev = this.liveScore;
        let score = this.myMatchScore(pr);
        // Présence encore figée sur le score du match précédent : on l'ignore jusqu'à sa mise à jour.
        if (score && prev && prev.matchId !== m.MatchID && score[0] === prev.score[0] && score[1] === prev.score[1] && score[0] + score[1] > 0) score = null;
        if (!score && prev?.matchId === m.MatchID) score = prev.score; // présence illisible : dernier score connu
        if (score) this.liveScore = { matchId: m.MatchID, score };
        const allies = all.filter((p) => teamOf.get(p.puuid) === myTeam);
        const enemies = all.filter((p) => teamOf.get(p.puuid) !== myTeam);
        const parties = this.matchParties(pr, party);
        labelParties([...allies, ...enemies], (p) => parties.get(p.puuid), (p) => teamOf.get(p.puuid));
        return {
          state: 'ingame',
          matchId: m.MatchID,
          map: this.assets.map(m.MapID),
          queue: m.MatchmakingData?.QueueID || null,
          score,
          side: this.sideAt(myTeam, m.ModeID, score || [0, 0]), // sans score : début de match
          allies,
          enemies,
        };
      }
    }
    return { state: 'idle' };
  }

  // ---------- Historique ----------
  /** keep = false : ne garde pas le match complet en mémoire (téléchargements en masse). */
  async matchDetails(id, keep = true) {
    if (this.matchCache.has(id)) return this.matchCache.get(id);
    // Deux demandes simultanées du même match (ex : deux coéquipiers) ne font qu'une requête.
    if (!this.matchPending.has(id)) {
      this.matchPending.set(
        id,
        this.client.getMatchDetails(id).finally(() => this.matchPending.delete(id))
      );
    }
    const d = await this.matchPending.get(id);
    if (d && keep) {
      this.matchCache.set(id, d);
      // Garde seulement les 60 derniers matchs complets en mémoire.
      if (this.matchCache.size > 60) this.matchCache.delete(this.matchCache.keys().next().value);
    }
    return d;
  }

  // ---------- Stats des joueurs (partie en direct) ----------
  // Dans le mode de la partie : K/D/A, K/D et HS sur l'acte en cours, résultats des 10 dernières parties.
  // Riot limite le détail des matchs à ~65 par minute : les carrés passent d'abord.
  //  1. En compétition, l'historique RR (une requête par joueur) donne tout de suite victoire ou défaite.
  //  2. Les détails des 10 dernières parties sont téléchargés en alternant les joueurs (la plus récente de
  //     chacun, puis la suivante…) : chaque ligne se remplit au même rythme et corrige les carrés provisoires.
  //  3. Le reste de l'acte vient ensuite, pour les moyennes.
  // Seuls les joueurs de la partie affichée sont servis : ceux de la précédente sortent de la file.

  /**
   * Renvoie les stats en cache ou lance leur calcul en arrière-plan (null en attendant). L'historique d'un
   * joueur ne bouge pas pendant la partie : relu à chaque nouveau match (détails déjà vus gardés en cache).
   */
  recentStats(puuid, queue, matchId) {
    const key = `${puuid}:${queue || ''}`;
    const hit = this.recent.get(key);
    if (hit?.matchId === matchId && !(hit.failedAt && Date.now() - hit.failedAt >= 30 * 1000)) return hit.value;
    // Les anciennes stats restent affichées pendant leur mise à jour.
    const entry = {
      matchId, puuid, queue: queue || null, value: hit?.value ?? null, ready: false,
      form: [], rr: new Map(), actIds: [], listed: false, capped: false, noAct: false, failed: new Set(),
    };
    this.recent.set(key, entry);
    // Riot en panne ou limite dépassée : nouvel essai au bout de 30 s, pas à chaque rafraîchissement.
    this.prepareRecent(entry).catch(() => (entry.failedAt = Date.now()));
    return entry.value;
  }

  async prepareRecent(entry) {
    const { puuid } = entry;
    // En parallèle de l'historique, sauf pour toi (tes matchs sont déjà dans le cache de l'onglet Stats).
    if (entry.queue === 'competitive' && puuid !== this.client.puuid) {
      this.client
        .getCompetitiveUpdates(0, 10, puuid)
        .then((res) => {
          const list = res?.Matches || [];
          list.forEach((m, i) => {
            // Une égalité rapporte peu de RR, une victoire en Immortel aussi : de 0 à ±5, le détail du match
            // tranche, téléchargé avant tout le reste.
            const rr = m.RankedRatingEarned || 0;
            if (Math.abs(rr) > 5) entry.rr.set(m.MatchID, rr > 0 ? 'win' : 'loss');
            else this.queueDetail({ prio: -1, order: i, entry, id: m.MatchID });
          });
          if (!entry.ready && list.length) {
            entry.form = list.map((m) => m.MatchID);
            entry.ready = true;
          }
          this.publishRecent(entry);
        })
        .catch(() => {});
    }
    const act = this.assets.currentAct();
    let queue = entry.queue;
    let list = await this.historyPage(puuid, queue, 0);
    if (!list.length && queue) list = await this.historyPage(puuid, (queue = null), 0); // rien dans ce mode : toutes files
    entry.form = list.slice(0, 10).map((m) => m.MatchID);
    entry.ready = true;
    // Acte en cours inconnu (données du jeu en retard sur un nouvel acte) : pas de moyennes plutôt que fausses.
    if (!act) entry.noAct = true;
    else entry.actIds = list.filter((m) => m.GameStartTime >= act.start).map((m) => m.MatchID);
    this.publishRecent(entry);
    entry.form.forEach((id, i) => this.queueDetail({ prio: 0, order: i, entry, id }));
    // Reste de l'acte : pages suivantes de l'historique, puis détails, une fois tous les carrés servis.
    if (act) {
      const more = list.length === 20 && list[19].GameStartTime >= act.start;
      this.queueDetail({ prio: 1, order: this.detailSeq++, entry, run: () => this.loadRecentAct(entry, queue, act.start, more) });
    }
  }

  async loadRecentAct(entry, queue, since, more) {
    // Riot ne garde qu'une centaine de parties : 5 pages au plus.
    for (let page = 1; more && page < 5; page++) {
      const list = await this.historyPage(entry.puuid, queue, page).catch(() => []);
      entry.actIds.push(...list.filter((m) => m.GameStartTime >= since).map((m) => m.MatchID));
      more = list.length === 20 && list[19].GameStartTime >= since;
    }
    entry.capped = more;
    entry.listed = true;
    entry.actIds.filter((id) => !entry.form.includes(id)).forEach((id) => this.queueDetail({ prio: 1, order: this.detailSeq++, entry, id }));
    this.publishRecent(entry);
  }

  /**
   * File commune des téléchargements : résultats douteux du RR (prio -1), carrés (prio 0, la plus récente de
   * chaque joueur d'abord), puis acte (prio 1).
   */
  queueDetail(task) {
    task.seq = this.detailSeq++;
    this.detailTasks.push(task);
    this.pumpDetails();
  }

  pumpDetails() {
    while (this.detailRunning < 4 && this.detailTasks.length) {
      const task = this.detailTasks.reduce((best, t) => (taskOrder(t, best) < 0 ? t : best));
      this.detailTasks.splice(this.detailTasks.indexOf(task), 1);
      const { entry } = task;
      // Joueur d'une autre partie, ou stats relancées entre-temps : abandonné.
      if (entry.matchId !== this.liveMatchId || this.recent.get(`${entry.puuid}:${entry.queue || ''}`) !== entry) continue;
      // Carré déjà donné par le RR : le détail ne sert plus qu'aux moyennes, s'il est de l'acte.
      if (task.prio === 0 && entry.rr.has(task.id)) {
        if (entry.actIds.includes(task.id)) this.queueDetail({ ...task, prio: 1, order: this.detailSeq++ });
        continue;
      }
      this.detailRunning++;
      (task.run ? task.run() : this.runDetail(task))
        .catch(() => {})
        .finally(() => {
          this.detailRunning--;
          this.pumpDetails();
        });
    }
  }

  async runDetail(task) {
    const { entry, id } = task;
    if (!(await this.matchRecord(id, entry.puuid))) {
      // Détail indisponible : un second essai après les autres joueurs, puis abandon (compté comme chargé).
      if (!task.retried) this.queueDetail({ ...task, order: task.prio === 1 ? this.detailSeq++ : task.order + 10, retried: true });
      else entry.failed.add(id);
    }
    this.publishRecent(entry);
  }

  /** Résumé d'un joueur dans un match : cache de l'onglet Stats pour toi, sinon téléchargé (null si indisponible). */
  async matchRecord(id, puuid) {
    const hit = this.cachedRecord(id, puuid);
    if (hit) return hit;
    const d = await this.matchDetails(id, false).catch(() => null);
    if (!d || !this.stats) return null;
    // Tous les joueurs suivis d'un coup : les membres d'un même groupe ont les mêmes parties.
    const tracked = new Set([...this.recent.values()].map((e) => e.puuid));
    for (const p of d.players || []) {
      if (!p.isObserver && tracked.has(p.subject)) this.records.set(`${p.subject}:${id}`, this.stats.record(d, p.subject));
    }
    while (this.records.size > 5000) this.records.delete(this.records.keys().next().value);
    return this.cachedRecord(id, puuid);
  }

  cachedRecord(id, puuid) {
    const k = `${puuid}:${id}`;
    return this.records.get(k) || this.stats?.cache.matches[k] || null;
  }

  /** Une page de 20 parties de l'historique d'un joueur, de la plus récente à la plus ancienne. */
  async historyPage(puuid, queue, page) {
    const h = await this.client.getMatchHistory(page * 20, (page + 1) * 20, queue || undefined, puuid);
    return h?.History || [];
  }

  publishRecent(entry) {
    if (!entry.ready) return;
    const recs = entry.actIds.map((id) => this.cachedRecord(id, entry.puuid)).filter(Boolean);
    const sum = (k) => recs.reduce((s, r) => s + (r[k] || 0), 0);
    const shots = sum('head') + sum('body') + sum('leg');
    // Acte complet : liste connue et chaque partie résumée ou abandonnée.
    const done = entry.noAct || (entry.listed && entry.actIds.every((id) => entry.failed.has(id) || this.cachedRecord(id, entry.puuid)));
    entry.value = {
      // Carré par partie : résultat exact du détail, sinon celui de l'historique RR, sinon en attente.
      form: entry.form.map((id) => this.cachedRecord(id, entry.puuid)?.result || entry.rr.get(id) || 'pending'),
      n: recs.length,
      total: entry.actIds.length,
      loading: !done,
      capped: entry.capped,
      noAct: entry.noAct,
      ...(recs.length && {
        kills: sum('kills') / recs.length,
        deaths: sum('deaths') / recs.length,
        assists: sum('assists') / recs.length,
        kd: sum('kills') / Math.max(1, sum('deaths')),
        hs: shots ? (sum('head') / shots) * 100 : null,
      }),
    };
  }

  /** Pseudos via le service de noms de Riot (le détail des matchs ne les fournit plus), mis en cache. */
  async namesCached(puuids) {
    this.nameCache ||= new Map();
    const missing = [...new Set(puuids)].filter((id) => id && !this.nameCache.has(id));
    for (let i = 0; i < missing.length; i += 50) {
      const res = await this.client.getNames(missing.slice(i, i + 50)).catch(() => []);
      for (const n of res || []) this.nameCache.set(n.Subject, { name: n.GameName || '', tag: n.TagLine || '' });
    }
    return this.nameCache;
  }

  summarizeMatch(d, names = new Map()) {
    const me = d.players?.find((p) => p.subject === this.client.puuid);
    if (!me) return null;
    const teams = d.teams || [];
    const myTeam = teams.find((t) => t.teamId === me.teamId);
    const other = teams.find((t) => t.teamId !== me.teamId);
    let result = 'loss';
    if (myTeam?.won) result = 'win';
    else if (myTeam && other && !other.won && myTeam.roundsWon === other.roundsWon) result = 'draw';

    // Résumé détaillé de chaque joueur (même calcul que l'onglet Stats).
    const players = d.players
      .filter((p) => !p.isObserver)
      .map((p) => {
        const r = this.stats?.record(d, p.subject) || {};
        const rounds = Math.max(1, r.rounds || p.stats?.roundsPlayed || 1);
        const shots = (r.head || 0) + (r.body || 0) + (r.leg || 0);
        const n = names.get(p.subject) || {};
        const agent = this.assets.agentById.get(String(p.characterId || '').toLowerCase());
        return {
          puuid: p.subject,
          name: n.name || p.gameName || agent?.name || 'Joueur',
          tag: n.tag || p.tagLine || '',
          agentId: String(p.characterId || '').toLowerCase(),
          teamId: p.teamId,
          team: p.teamId === me.teamId ? 'ally' : 'enemy',
          level: p.accountLevel ?? null,
          tier: p.competitiveTier || 0,
          party: p.partyId || null,
          kills: p.stats?.kills || 0,
          deaths: p.stats?.deaths || 0,
          assists: p.stats?.assists || 0,
          acs: Math.round((p.stats?.score || 0) / rounds),
          adr: Math.round((r.damage || 0) / rounds),
          hs: shots ? Math.round(((r.head || 0) / shots) * 100) : null,
          fb: r.fb || 0,
          kast: r.kast != null ? Math.round((r.kast / rounds) * 100) : null,
          isMe: p.subject === this.client.puuid,
        };
      })
      .sort((x, y) => y.acs - x.acs);

    labelParties(players, (p) => p.party, (p) => p.teamId);

    // MVP de la partie (meilleur ACS) et MVP de l'autre équipe.
    if (players.length) {
      players[0].mvp = 'match';
      const otherBest = players.find((p) => p.teamId !== players[0].teamId);
      if (otherBest && teams.length === 2) otherBest.mvp = 'team';
    }
    const mine = players.find((p) => p.isMe);
    const placement = players.indexOf(mine) + 1;

    return {
      id: d.matchInfo?.matchId,
      map: this.assets.map(d.matchInfo?.mapId),
      queue: d.matchInfo?.queueID || d.matchInfo?.queueId || '',
      startedAt: d.matchInfo?.gameStartMillis,
      lengthMs: d.matchInfo?.gameLengthMillis,
      agentId: mine.agentId,
      kills: mine.kills,
      deaths: mine.deaths,
      assists: mine.assists,
      acs: mine.acs,
      adr: mine.adr,
      hs: mine.hs,
      tier: mine.tier,
      mvp: mine.mvp || null,
      placement,
      playerCount: players.length,
      result,
      score: myTeam && other ? [myTeam.roundsWon, other.roundsWon] : null,
      teams: teams.length === 2
        ? [myTeam, other].map((t) => ({
            teamId: t.teamId,
            side: t.teamId === me.teamId ? 'ally' : 'enemy',
            won: !!t.won,
            rounds: t.roundsWon,
            players: players.filter((p) => p.teamId === t.teamId),
          }))
        : [{ teamId: 'all', side: 'all', won: result === 'win', rounds: null, players }], // combat à mort : classement unique
    };
  }

  async history(queue) {
    const h = await this.client.getMatchHistory(0, 15, queue);
    const list = h?.History || [];
    const details = (await Promise.all(list.map((m) => this.matchDetails(m.MatchID).catch(() => null)))).filter(Boolean);
    const names = await this.namesCached(details.flatMap((d) => (d.players || []).map((p) => p.subject)));
    return details.map((d) => this.summarizeMatch(d, names)).filter(Boolean);
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
    let myParty = null; // pour repérer les amis qui sont dans ton groupe
    for (const p of pr?.presences || []) {
      if (p.puuid === this.client.puuid) {
        if (p.product === 'valorant') {
          const d = decodePresence(p);
          myParty = d?.partyId || d?.partyPresenceData?.partyId || null;
        }
        continue;
      }
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
      const cardId = d?.playerCardId || player.playerCardId;
      const titleId = d?.playerTitleId || player.playerTitleId;
      const card = cardId ? this.assets.cardById.get(String(cardId).toLowerCase()) : null;
      const title = titleId ? this.assets.titleById.get(String(titleId).toLowerCase()) : null;
      const map = d ? this.assets.map(d.matchMap || match.matchMap || d.partyOwnerMatchMap || party.partyOwnerMatchMap) : null;
      const partyId = d?.partyId || party.partyId || null;
      const seen = Number(f.last_online_ts) || null; // en ms, parfois en secondes
      return {
        puuid: f.puuid,
        pid: f.pid,
        name: f.game_name || p?.game_name || '???',
        tag: f.game_tag || p?.game_tag || '',
        note: f.note || '',
        online: !!p && p.state !== 'offline',
        status: p?.state || 'offline', // chat | away | dnd | mobile
        product: p?.product || null,
        lastOnline: seen && seen < 1e12 ? seen * 1000 : seen,
        card: card ? { small: card.small, wide: card.wide } : null,
        title: title?.name || null,
        valorant: d
          ? {
              loop, // MENUS | PREGAME | INGAME
              queue: d.queueId || match.queueId || '',
              map: map ? { name: map.name, icon: map.listIcon, splash: map.splash } : null,
              partySize: d.partySize || party.partySize || 1,
              partyMax: d.maxPartySize || party.maxPartySize || 5,
              partyState: d.partyState || party.partyState || '', // MATCHMAKING = en file
              withMe: !!(myParty && partyId === myParty),
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

  // ---------- Messagerie ----------
  /** Messages non lus par conversation privée : { pid: { count, last } } (last = id du dernier message). */
  async chatUnread() {
    const res = await this.client.getConversations();
    const unread = {};
    for (const c of res?.conversations || []) {
      if (c.type === 'chat' && c.unread_count > 0 && !c.muted) unread[c.cid] = { count: c.unread_count, last: c.mid };
    }
    return unread;
  }

  async chatMessages(cid) {
    if (!CID_RE.test(cid || '')) throw new Error('Conversation invalide.');
    // 404 = aucune conversation avec cet ami pour l'instant.
    const res = await this.client.getMessages(cid).catch((e) => {
      if (e.status === 404) return null;
      throw e;
    });
    return (res?.messages || [])
      .filter((m) => m.cid === cid && m.type === 'chat' && !m.uicEvent)
      .map((m) => ({ id: m.id, mine: m.puuid === this.client.puuid, body: m.body || '', time: Number(m.time) || 0, name: m.game_name || m.name || '' }))
      .sort((a, b) => a.time - b.time);
  }

  /** Marque la conversation comme lue dans le Riot Client aussi. */
  async chatRead(cid, id) {
    if (!CID_RE.test(cid || '') || !id) return false;
    await this.client.markRead(cid, String(id));
    return true;
  }

  async chatSend(cid, text) {
    const message = String(text || '').trim();
    if (!CID_RE.test(cid || '')) throw new Error('Conversation invalide.');
    if (!message) throw new Error('Message vide.');
    if (message.length > CHAT_MAX) throw new Error(`Message trop long (${CHAT_MAX} caractères maximum).`);
    // On n'écrit qu'à ses amis.
    const friends = await this.client.getFriends();
    if (!(friends?.friends || []).some((f) => f.pid === cid)) throw new Error("Ce joueur n’est pas dans votre liste d’amis.");
    await this.client.sendMessage(cid, message);
    return true;
  }
}

const CID_RE = /^[\w-]+@[\w.-]+$/;
const taskOrder = (a, b) => a.prio - b.prio || a.order - b.order || a.seq - b.seq;
const CHAT_MAX = 500;

module.exports = { Services, myPresence };
