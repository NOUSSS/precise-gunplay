// Surveillance de la connexion au Riot Client : la vérification périodique, sortie de main.js pour être
// testée sans Electron.

// Vérifications sans réponse tolérées d'affilée avant de déclarer la connexion perdue. Le Riot Client met
// parfois plus de 5 s à répondre (lancement du jeu, fin de partie) : couper au premier raté vidait
// l'interface pour la recharger aussitôt.
const MISSED_CHECKS_MAX = 3;

/**
 * Renvoie la fonction de vérification, à appeler à intervalle régulier tant que le client est connecté.
 * - client : RiotClient (refreshTokens, tokens, puuid)
 * - lockfileUnchanged() : vrai si le fichier de verrou existe et désigne toujours le même Riot Client
 * - onLost(erreur) : connexion perdue, à l'appelant de réinitialiser le client et de prévenir l'interface
 * - onAccountChanged() : un autre compte est connecté dans le Riot Client
 * Résultat : 'ok', 'missed' (raté toléré), 'lost', 'changed' ou 'busy' (vérification précédente en cours).
 */
function connectionWatcher({ client, lockfileUnchanged, onLost, onAccountChanged }) {
  let missed = 0;
  let checking = false;
  return async function check() {
    if (checking) return 'busy';
    checking = true;
    const previous = client.puuid;
    const tokens = client.tokens;
    try {
      if (!lockfileUnchanged()) throw Object.assign(new Error('Riot Client fermé. En attente…'), { code: 'RIOT_CLIENT_CLOSED' });
      await client.refreshTokens();
      missed = 0;
      if (client.puuid !== previous) {
        onAccountChanged();
        return 'changed';
      }
      return 'ok';
    } catch (e) {
      // Pas de réponse, mais le même Riot Client est toujours annoncé par son fichier de verrou : on
      // garde les jetons (encore valables côté Riot) et on réessaie au tour suivant.
      if (e.code === 'RIOT_CLIENT_CLOSED' && lockfileUnchanged() && ++missed < MISSED_CHECKS_MAX) {
        client.tokens = tokens;
        return 'missed';
      }
      missed = 0;
      onLost(e);
      return 'lost';
    } finally {
      checking = false;
    }
  };
}

module.exports = { connectionWatcher, MISSED_CHECKS_MAX };
