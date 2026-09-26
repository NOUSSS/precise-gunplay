// Fonctions qui agissent sur le compte via le Riot Client (sélection d'agent, groupe, messagerie).
// Désactivées : Riot peut sanctionner ces actions faites par un logiciel tiers. L'interface les affiche grisées.
const CLIENT_ACTIONS_DISABLED = true;
const CLIENT_ACTIONS_MESSAGE =
  'Fonction désactivée : elle agit directement sur ton compte via le Riot Client, ce que Riot peut sanctionner (suspension de compte).';

function assertClientActionsAllowed() {
  if (CLIENT_ACTIONS_DISABLED) throw Object.assign(new Error(CLIENT_ACTIONS_MESSAGE), { code: 'CLIENT_ACTIONS_DISABLED' });
}

module.exports = { CLIENT_ACTIONS_DISABLED, CLIENT_ACTIONS_MESSAGE, assertClientActionsAllowed };
