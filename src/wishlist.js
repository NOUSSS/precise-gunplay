// Liste de souhaits de PX-0 (bot Discord) : l'app la lit et la modifie, PX-0 envoie les alertes en message privé.
// PX-0 reconnaît le compte grâce au jeton d'accès du Riot Client, qu'il fait vérifier par Riot sans le garder.
const { app } = require('electron');

const PX0_URL = 'https://px0.feitanx.com';
const SKIN_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const ERRORS = {
  full: (b) => `Votre liste est pleine (${b.max} skins au maximum).`,
  unknown_skin: () => 'PX-0 ne connaît pas encore ce skin. Réessayez après la prochaine mise à jour du jeu.',
  rate_limited: () => 'Trop de modifications d’un coup : patientez une minute.',
  riot_unavailable: () => 'Riot ne répond pas pour le moment : réessayez dans quelques minutes.',
  token: () => 'Riot a refusé la session : reconnectez-vous dans le Riot Client.',
};

class Wishlist {
  constructor(client) {
    this.client = client;
  }

  async request(method, skinId, retry = true) {
    if (skinId !== undefined && !SKIN_ID.test(String(skinId))) throw new Error('Skin invalide.');
    const token = this.client.tokens?.access;
    if (!token) throw new Error('Compte non connecté. Lancez VALORANT et connectez-vous.');
    let res;
    try {
      res = await fetch(`${PX0_URL}/valorant/wishlist${skinId ? `/${skinId}` : ''}`, {
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
      return this.request(method, skinId, false);
    }
    if (res.ok || body?.linked === false) return body;
    throw new Error(ERRORS[body?.error]?.(body) || `PX-0 a renvoyé une erreur (${res.status}).`);
  }

  get() {
    return this.request('GET');
  }

  add(skinId) {
    return this.request('PUT', skinId);
  }

  remove(skinId) {
    return this.request('DELETE', skinId);
  }
}

module.exports = { Wishlist };
