// Couche de données — MODE DÉMO (navigateur).
// Toute l'app passe par ce module : pour brancher Supabase plus tard,
// on remplace l'implémentation de ces fonctions sans toucher aux pages.
import { useSyncExternalStore } from 'react';
import { seed } from './seed.js';

const KEY = 'bounama-demo-v1';
const SESSION = 'bounama-session';
const listeners = new Set();

function load() {
  try {
    const s = localStorage.getItem(KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return seed();
}
let state = load();

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  listeners.forEach((l) => l());
}
function set(fn) { state = { ...state }; fn(state); save(); }

export const uid = (p = 'id') => p + '_' + Math.random().toString(36).slice(2, 9);
export const now = () => new Date().toISOString();

export function useData(sel = (s) => s) {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => sel(state)
  );
}
export const getState = () => state;

export function resetDemo() {
  state = seed();
  try { localStorage.removeItem(SESSION); } catch {}
  save();
}

/* ---------- Session ---------- */
let sessionId = null;
try { sessionId = localStorage.getItem(SESSION); } catch {}
export function useMe() {
  const users = useData((s) => s.users);
  return users.find((u) => u.id === sessionId) || null;
}
export function login(tel, password) {
  const t = normTel(tel);
  const u = state.users.find((x) => normTel(x.tel) === t && x.password === password);
  if (!u) return { error: 'Numéro ou mot de passe incorrect.' };
  if (u.statut === 'en_attente') return { error: "Votre inscription n'a pas encore été validée par le professeur." };
  if (u.statut === 'refuse') return { error: "Votre inscription n'a pas été acceptée. Contactez le professeur." };
  sessionId = u.id;
  try { localStorage.setItem(SESSION, u.id); } catch {}
  listeners.forEach((l) => l());
  return { user: u };
}
export function loginAs(id) {
  sessionId = id;
  try { localStorage.setItem(SESSION, id); } catch {}
  listeners.forEach((l) => l());
}
export function logout() {
  sessionId = null;
  try { localStorage.removeItem(SESSION); } catch {}
  listeners.forEach((l) => l());
}
export const normTel = (t = '') => String(t).replace(/\D/g, '').replace(/^221/, '');

/* ---------- Site ---------- */
export const updateSite = (patch) => set((s) => { s.site = { ...s.site, ...patch }; });

/* ---------- Inscriptions / élèves ---------- */
export function inscrire(d) {
  if (state.users.some((u) => normTel(u.tel) === normTel(d.tel)))
    return { error: 'Ce numéro est déjà inscrit. Connectez-vous ou contactez le professeur.' };
  const u = { id: uid('u'), role: 'eleve', statut: 'en_attente', classeIds: [], creeLe: now(), ...d };
  set((s) => { s.users = [...s.users, u]; });
  return { user: u };
}
export const updateUser = (id, patch) =>
  set((s) => { s.users = s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)); });
export function ajouterEleve(d) {
  const u = { id: uid('u'), role: 'eleve', statut: 'actif', classeIds: [], creeLe: now(), ...d };
  set((s) => { s.users = [...s.users, u]; });
  return u;
}
export const supprimerUser = (id) => set((s) => { s.users = s.users.filter((u) => u.id !== id); });

/* ---------- Classes ---------- */
export const ajouterClasse = (d) => set((s) => { s.classes = [...s.classes, { id: uid('c'), ...d }]; });
export const updateClasse = (id, patch) =>
  set((s) => { s.classes = s.classes.map((c) => (c.id === id ? { ...c, ...patch } : c)); });
export const supprimerClasse = (id) => set((s) => {
  s.classes = s.classes.filter((c) => c.id !== id);
  s.users = s.users.map((u) => ({ ...u, classeIds: (u.classeIds || []).filter((x) => x !== id) }));
});

/* ---------- Cours ---------- */
export const ajouterCours = (d) => set((s) => { s.cours = [{ id: uid('co'), date: now(), ...d }, ...s.cours]; });
export const supprimerCours = (id) => set((s) => { s.cours = s.cours.filter((c) => c.id !== id); });

/* ---------- Annonces ---------- */
export const ajouterAnnonce = (d) => set((s) => { s.annonces = [{ id: uid('a'), date: now(), ...d }, ...s.annonces]; });
export const supprimerAnnonce = (id) => set((s) => { s.annonces = s.annonces.filter((a) => a.id !== id); });

/* ---------- Questions sous les cours ---------- */
export const poserQuestion = (d) => set((s) => { s.questions = [...s.questions, { id: uid('q'), date: now(), reponses: [], ...d }]; });
export const repondreQuestion = (qid, d) => set((s) => {
  s.questions = s.questions.map((q) => (q.id === qid ? { ...q, reponses: [...q.reponses, { date: now(), ...d }] } : q));
});

/* ---------- Messages privés ---------- */
export const envoyerMessage = (d) => set((s) => { s.messages = [...s.messages, { id: uid('m'), date: now(), lu: false, ...d }]; });
export const marquerLus = (moi, autre) => set((s) => {
  s.messages = s.messages.map((m) => (m.toId === moi && m.fromId === autre ? { ...m, lu: true } : m));
});

/* ---------- Devoirs ---------- */
export const ajouterDevoir = (d) => set((s) => { s.devoirs = [{ id: uid('d'), date: now(), rendus: [], ...d }, ...s.devoirs]; });
export const supprimerDevoir = (id) => set((s) => { s.devoirs = s.devoirs.filter((d) => d.id !== id); });
export const rendreDevoir = (did, rendu) => set((s) => {
  s.devoirs = s.devoirs.map((d) => d.id !== did ? d : {
    ...d, rendus: [...d.rendus.filter((r) => r.eleveId !== rendu.eleveId), { date: now(), ...rendu }],
  });
});
export const noterRendu = (did, eleveId, patch) => set((s) => {
  s.devoirs = s.devoirs.map((d) => d.id !== did ? d : {
    ...d, rendus: d.rendus.map((r) => (r.eleveId === eleveId ? { ...r, ...patch } : r)),
  });
});

/* ---------- Planning ---------- */
export const ajouterSeance = (d) => set((s) => { s.seances = [...s.seances, { id: uid('s'), ...d }]; });
export const supprimerSeance = (id) => set((s) => { s.seances = s.seances.filter((x) => x.id !== id); });

/* ---------- Paiements ---------- */
export const ajouterPaiement = (d) => set((s) => { s.paiements = [{ id: uid('p'), date: now(), ...d }, ...s.paiements]; });
export const supprimerPaiement = (id) => set((s) => { s.paiements = s.paiements.filter((p) => p.id !== id); });

/* ---------- Fichiers (IndexedDB, pour ne pas saturer le stockage) ---------- */
function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('bounama-fichiers', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('f');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
export async function saveFile(file) {
  const id = uid('f');
  const db = await idb();
  await new Promise((res, rej) => {
    const tx = db.transaction('f', 'readwrite');
    tx.objectStore('f').put(file, id);
    tx.oncomplete = res; tx.onerror = () => rej(tx.error);
  });
  return { fichierId: id, fichierNom: file.name, fichierType: file.type, fichierTaille: file.size };
}
export async function getFile(id) {
  const db = await idb();
  return new Promise((res, rej) => {
    const r = db.transaction('f').objectStore('f').get(id);
    r.onsuccess = () => res(r.result || null); r.onerror = () => rej(r.error);
  });
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
