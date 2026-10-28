// Couche de données : tout passe par l'API (/api), base Neon côté serveur.
// Les pages lisent l'état avec useData() et appellent les actions ci-dessous.
import { useSyncExternalStore } from 'react';

const TOKEN = 'bounama-token';
const EMPTY = {
  site: { nom: '', slogan: '', prof: '', apropos: '', matieres: '', niveaux: '', tel: '', zone: '', tarifs: [] },
  nbEleves: 0, me: null, users: [], classes: [], cours: [], questions: [], annonces: [],
  messages: [], devoirs: [], seances: [], paiements: [], presences: [], discussions: [], parents: [],
};
let state = EMPTY;
let status = { publicReady: false, authReady: false, error: '' };
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

let token = null;
try { token = localStorage.getItem(TOKEN); } catch {}
const setToken = (t) => { token = t; try { t ? localStorage.setItem(TOKEN, t) : localStorage.removeItem(TOKEN); } catch {} };

export function useData(sel = (s) => s) {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => sel(state));
}
export function useStatus() {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => status);
}
export const useMe = () => useData((s) => s.me);
export const espaceDe = (u) => (u?.role === 'prof' ? '/prof' : u?.role === 'parent' ? '/parent' : '/eleve');
const setStatus = (p) => { status = { ...status, ...p }; emit(); };
export const clearError = () => setStatus({ error: '' });

async function api(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (token) headers.Authorization = 'Bearer ' + token;
  if (opts.json !== undefined) { headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(opts.json); }
  let r;
  try { r = await fetch('/api/' + path, { ...opts, headers }); }
  catch { throw new Error('Pas de connexion internet. Réessayez.'); }
  const data = await r.json().catch(() => ({}));
  if (r.status === 401 && token && path !== 'login') { setToken(null); state = { ...state, me: null }; emit(); }
  if (!r.ok) throw new Error(data.error || 'Une erreur est survenue.');
  return data;
}
const applyState = (s) => { state = { ...state, ...s }; emit(); };

/* ---------- Chargement ---------- */
export async function loadPublic() {
  try { const d = await api('public'); state = { ...state, site: d.site, nbEleves: d.nbEleves }; } catch {}
  setStatus({ publicReady: true });
}
export async function refresh() {
  if (!token) return setStatus({ authReady: true });
  try { const d = await api('state'); applyState(d.state); } catch {}
  setStatus({ authReady: true });
}
loadPublic();
refresh();
// Mise à jour régulière (nouveaux messages, devoirs rendus…)
setInterval(() => { if (token && document.visibilityState === 'visible') refresh(); }, 20000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && token) refresh(); });

/* ---------- Session ---------- */
export async function login(tel, password) {
  try {
    const d = await api('login', { method: 'POST', json: { tel, password } });
    setToken(d.token); applyState(d.state);
    return { user: d.state.me };
  } catch (e) { return { error: e.message }; }
}
export function logout() {
  setToken(null);
  try { navigator.serviceWorker?.controller?.postMessage('vider-cache'); } catch {}
  state = { ...EMPTY, site: state.site, nbEleves: state.nbEleves };
  emit();
}
export async function inscrire(d) {
  try { await api('inscription', { method: 'POST', json: d }); return { ok: true }; }
  catch (e) { return { error: e.message }; }
}
export const normTel = (t = '') => String(t).replace(/\D/g, '').replace(/^221/, '');

/* ---------- Actions ---------- */
async function act(type, p) {
  try {
    const d = await api('action', { method: 'POST', json: { type, p } });
    applyState(d.state);
    if (type === 'updateSite') state = { ...state }; // le site public suit
    return true;
  } catch (e) { setStatus({ error: e.message }); return false; }
}
export const updateSite = (p) => act('updateSite', p).then((ok) => { if (ok) loadPublic(); return ok; });
export const updateUser = (id, patch) => act('updateUser', { id, patch });
export const ajouterEleve = (d) => act('ajouterEleve', d);
export const supprimerUser = (id) => act('supprimerUser', { id });
export const ajouterClasse = (d) => act('ajouterClasse', d);
export const updateClasse = (id, patch) => act('updateClasse', { id, patch });
export const supprimerClasse = (id) => act('supprimerClasse', { id });
export const ajouterCours = (d) => act('ajouterCours', d);
export const supprimerCours = (id) => act('supprimerCours', { id });
export const ajouterAnnonce = (d) => act('ajouterAnnonce', d);
export const supprimerAnnonce = (id) => act('supprimerAnnonce', { id });
export const poserQuestion = (d) => act('poserQuestion', d);
export const repondreQuestion = (questionId, d) => act('repondreQuestion', { questionId, texte: d.texte });
export const envoyerMessage = (d) => act('envoyerMessage', d);
export const marquerLus = (_moi, autreId) => act('marquerLus', { autreId });
export const ajouterDevoir = (d) => act('ajouterDevoir', d);
export const supprimerDevoir = (id) => act('supprimerDevoir', { id });
export const rendreDevoir = (devoirId, r) => act('rendreDevoir', { devoirId, ...r });
export const noterRendu = (devoirId, eleveId, patch) => act('noterRendu', { devoirId, eleveId, patch });
export const ajouterSeance = (d) => act('ajouterSeance', d);
export const supprimerSeance = (id) => act('supprimerSeance', { id });
export const ajouterPaiement = (d) => act('ajouterPaiement', d);
export const supprimerPaiement = (id) => act('supprimerPaiement', { id });
export const changerMotDePasse = (password) => act('changerMotDePasse', { password });
export const enregistrerPresences = (classeId, date, lignes) => act('enregistrerPresences', { classeId, date, lignes });
export const posterDiscussion = (classeId, texte) => act('posterDiscussion', { classeId, texte });
export const reinitParent = (id) => act('reinitParent', { id });

/* ---------- Fichiers ---------- */
export const MAX_FICHIER = 4 * 1024 * 1024;
export async function saveFile(file) {
  if (file.size > MAX_FICHIER) throw new Error('Fichier trop lourd (4 Mo maximum). Pour une vidéo, utilisez un lien YouTube.');
  return api('upload', {
    method: 'POST', body: file,
    headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-Filename': encodeURIComponent(file.name) },
  });
}
export async function getFile(id) {
  const r = await fetch('/api/file?id=' + encodeURIComponent(id), { headers: token ? { Authorization: 'Bearer ' + token } : {} });
  return r.ok ? r.blob() : null;
}

/* ---------- Helpers ---------- */
export const moisCourant = () => new Date().toISOString().slice(0, 7);
export function elevesDeClasse(s, classeId) {
  return s.users.filter((u) => u.role === 'eleve' && u.statut === 'actif' && (u.classeIds || []).includes(classeId));
}
export function statutPaiement(s, eleve, mois = moisCourant()) {
  const paye = s.paiements.filter((p) => p.eleveId === eleve.id && p.mois === mois).reduce((a, p) => a + Number(p.montant || 0), 0);
  const du = Number(eleve.tarif || 0);
  if (!du) return { paye, du, etat: paye ? 'paye' : 'na' };
  return { paye, du, etat: paye >= du ? 'paye' : paye > 0 ? 'partiel' : 'impaye' };
}
