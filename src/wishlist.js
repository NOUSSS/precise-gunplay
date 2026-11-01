// Liste de souhaits de PX-0 (bot Discord) : l'app la lit et la modifie, PX-0 envoie les alertes en message privé.
// PX-0 reconnaît le compte grâce au jeton d'accès du Riot Client, qu'il fait vérifier par Riot sans le garder.
const { app } = require('electron');

const PX0_URL = 'https://px0.feitanx.com';
const SKIN_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const LINK_ID = /^[0-9a-f]{32}$/;

const ERRORS = {
  full: (b) => `Votre liste est pleine (${b.max} skins au maximum).`,
  unknown_skin: () => 'PX-0 ne connaît pas encore ce skin. Réessayez après la prochaine mise à jour du jeu.',
  rate_limited: () => 'Trop de modifications d’un coup : patientez une minute.',
  riot_unavailable: () => 'Riot ne répond pas pour le moment : réessayez dans quelques minutes.',
  token: () => 'Riot a refusé la session : reconnectez-vous dans le Riot Client.',
  expired: () => 'Cette connexion a expiré : recommencez.',
};

class Wishlist {
  constructor(client) {
    this.client = client;
  }

  async request(method, path, retry = true) {
    const token = this.client.tokens?.access;
    if (!token) throw new Error('Compte non connecté. Lancez VALORANT et connectez-vous.');
    let res;
    try {
      res = await fetch(`${PX0_URL}/valorant/${path}`, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': `PreciseGunplay/${app.getVersion()}` },
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new Error('PX-0 ne répond pas. Vérifiez votre connexion puis réessayez.');
    }
    const body = await res.json().catch(() => null);
    // Jeton renouvelé par le Riot Client entre deux vérifications : on reprend le nouveau une fois.
    if (res.status === 401 && retry) {
      await this.client.refreshTokens().catch(() => {});
      return this.request(method, path, false);
    }
    if (res.ok || body?.linked === false) return body;
    throw new Error(ERRORS[body?.error]?.(body) || `PX-0 a renvoyé une erreur (${res.status}).`);
  }

  skin(method, skinId) {
    if (!SKIN_ID.test(String(skinId))) throw new Error('Skin invalide.');
    return this.request(method, `wishlist/${skinId}`);
  }

  get() {
    return this.request('GET', 'wishlist');
  }

  add(skinId) {
    return this.skin('PUT', skinId);
  }

  remove(skinId) {
    return this.skin('DELETE', skinId);
  }

  // Connexion à PX-0 sans commande : Discord dans le navigateur (à qui écrire), puis QR code Riot Mobile (la session
  // Riot qui dure). PX-0 tient l'état de la liaison ; l'app le relit jusqu'à la fin.
  linkStart() {
    return this.request('POST', 'link');
  }

  link(id, qr = false) {
    if (!LINK_ID.test(String(id))) throw new Error('Connexion invalide.');
    return this.request(qr ? 'POST' : 'GET', `link/${id}${qr ? '/qr' : ''}`);
  }
}

module.exports = { Wishlist };
