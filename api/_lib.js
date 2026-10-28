// Outils partagés par les fonctions /api (non exposé comme route : préfixe _)
import { neon } from '@neondatabase/serverless';
import { SignJWT, jwtVerify } from 'jose';

let _query = null;
// Permet de remplacer la base pour les tests locaux
export function setQuery(fn) { _query = fn; }
export async function q(text, params = []) {
  if (!_query) {
    const sql = neon(process.env.DATABASE_URL);
    _query = async (t, p) => ({ rows: await sql(t, p) });
  }
  return (await _query(text, params)).rows;
}

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');
export const sign = (u) =>
  new SignJWT({ sub: u.id, role: u.role }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('60d').sign(secret());

export async function auth(req) {
  const h = req.headers.authorization || '';
  const tok = h.startsWith('Bearer ') ? h.slice(7) : (new URL(req.url, 'http://x').searchParams.get('t') || '');
  if (!tok) return null;
  try {
    const { payload } = await jwtVerify(tok, secret());
    const [u] = await q('select * from users where id = $1', [payload.sub]);
    return u && u.statut === 'actif' ? u : null;
  } catch { return null; }
}

export const uid = (p) => p + '_' + crypto.randomUUID().replace(/-/g, '').slice(0, 12);
export const normTel = (t = '') => String(t).replace(/\D/g, '').replace(/^221/, '');

export function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

export async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

export function handler(fn) {
  return async (req, res) => {
    try { await fn(req, res); }
    catch (e) {
      console.error(e);
      send(res, e.status || 500, { error: e.status ? e.message : 'Erreur du serveur. Réessayez.' });
    }
  };
}
export const fail = (status, message) => Object.assign(new Error(message), { status });

const iso = (d) => (d instanceof Date ? d.toISOString() : d);
const day = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10));

export function publicUser(u, full) {
  const base = { id: u.id, role: u.role, nom: u.nom, statut: u.statut };
  if (!full) return base;
  return {
    ...base, tel: u.tel, niveau: u.niveau, ecole: u.ecole, parentTel: u.parent_tel, adresse: u.adresse,
    matieresVoulues: u.matieres_voulues, lieuVoulu: u.lieu_voulu, tarif: u.tarif, classeIds: u.classe_ids || [], creeLe: iso(u.cree_le),
  };
}

// Construit tout ce que l'utilisateur a le droit de voir
export async function loadState(me) {
  if (me.role === 'parent') return loadParent(me);
  const prof = me.role === 'prof';
  const cls = me.classe_ids || [];
  const [site] = await q('select data from site where id = 1');
  const users = prof
    ? await q("select * from users where role <> 'parent' order by nom")
    : await q("select * from users where role = 'prof' or id = $1 or (statut = 'actif' and classe_ids && $2::text[])", [me.id, cls]);
  const parents = prof ? await q("select id, nom, tel, enfant_ids from users where role = 'parent'") : [];
  const classes = prof ? await q('select * from classes order by nom') : await q('select * from classes where id = any($1)', [cls]);
  const cours = prof
    ? await q('select * from cours order by date desc')
    : await q('select * from cours where classe_id = any($1) order by date desc', [cls]);
  const questions = await q('select * from questions where cours_id = any($1) order by date', [cours.map((c) => c.id)]);
  const reponses = await q('select * from reponses where question_id = any($1) order by date', [questions.map((x) => x.id)]);
  const annonces = prof
    ? await q('select * from annonces order by date desc')
    : await q("select * from annonces where classe_id = 'tous' or classe_id = any($1) order by date desc", [cls]);
  const messages = await q('select * from messages where from_id = $1 or to_id = $1 order by date', [me.id]);
  const devoirs = prof
    ? await q('select * from devoirs order by date desc')
    : await q('select * from devoirs where classe_id = any($1) order by date desc', [cls]);
  const rendus = prof ? await q('select * from rendus') : await q('select * from rendus where eleve_id = $1', [me.id]);
  const seances = prof ? await q('select * from seances') : await q('select * from seances where classe_id = any($1)', [cls]);
  const paiements = prof
    ? await q('select * from paiements order by date desc')
    : await q('select * from paiements where eleve_id = $1 order by date desc', [me.id]);
  const presences = prof
    ? await q("select * from presences where date > now() - interval '120 days'")
    : await q('select * from presences where eleve_id = $1', [me.id]);
  const discussions = await q("select * from discussions where classe_id = any($1) and date > now() - interval '60 days' order by date", [classes.map((c) => c.id)]);

  return {
    site: site?.data || {},
    me: publicUser(me, true),
    users: users.map((u) => publicUser(u, prof || u.id === me.id)),
    parents: parents.map((p) => ({ id: p.id, nom: p.nom, tel: p.tel, enfantIds: p.enfant_ids || [] })),
    classes: classes.map(mapClasse),
    cours: cours.map((c) => ({ id: c.id, classeId: c.classe_id, chapitre: c.chapitre, titre: c.titre, description: c.description, type: c.type, url: c.url, contenu: c.contenu, fichierId: c.fichier_id, fichierNom: c.fichier_nom, date: iso(c.date) })),
    questions: questions.map((x) => ({
      id: x.id, coursId: x.cours_id, auteurId: x.auteur_id, texte: x.texte, date: iso(x.date),
      reponses: reponses.filter((r) => r.question_id === x.id).map((r) => ({ auteurId: r.auteur_id, texte: r.texte, date: iso(r.date) })),
    })),
    annonces: annonces.map((a) => ({ id: a.id, classeId: a.classe_id, texte: a.texte, date: iso(a.date) })),
    messages: messages.map((m) => ({ id: m.id, fromId: m.from_id, toId: m.to_id, texte: m.texte, date: iso(m.date), lu: m.lu })),
    devoirs: devoirs.map((d) => mapDevoir(d, rendus)),
    seances: seances.map(mapSeance),
    paiements: paiements.map(mapPaiement),
    presences: presences.map(mapPresence),
    discussions: discussions.map((x) => ({ id: x.id, classeId: x.classe_id, auteurId: x.auteur_id, texte: x.texte, date: iso(x.date) })),
  };
}

// Parent : uniquement notes, paiements, présences et séances de ses enfants
async function loadParent(me) {
  const ids = me.enfant_ids || [];
  const [site] = await q('select data from site where id = 1');
  const enfants = await q("select * from users where id = any($1) and role = 'eleve'", [ids]);
  const cls = [...new Set(enfants.flatMap((e) => e.classe_ids || []))];
  const prof = await q("select * from users where role = 'prof'");
  const classes = await q('select * from classes where id = any($1)', [cls]);
  const devoirs = await q('select * from devoirs where classe_id = any($1) order by date desc', [cls]);
  const rendus = await q('select * from rendus where eleve_id = any($1)', [ids]);
  const paiements = await q('select * from paiements where eleve_id = any($1) order by date desc', [ids]);
  const presences = await q('select * from presences where eleve_id = any($1)', [ids]);
  const seances = await q('select * from seances where classe_id = any($1)', [cls]);
  return {
    site: site?.data || {},
    me: { ...publicUser(me, true), enfantIds: ids },
    users: [...enfants.map((u) => publicUser(u, true)), ...prof.map((u) => publicUser(u))],
    parents: [], classes: classes.map(mapClasse), cours: [], questions: [], annonces: [], messages: [], discussions: [],
    devoirs: devoirs.map((d) => mapDevoir(d, rendus)),
    seances: seances.map(mapSeance),
    paiements: paiements.map(mapPaiement),
    presences: presences.map(mapPresence),
  };
}

const mapClasse = (c) => ({ id: c.id, nom: c.nom, lieu: c.lieu, niveau: c.niveau, matiere: c.matiere, couleur: c.couleur });
const mapSeance = (x) => ({ id: x.id, classeId: x.classe_id, jour: x.jour, heure: x.heure, duree: x.duree, lieu: x.lieu, lien: x.lien || '' });
const mapPaiement = (p) => ({ id: p.id, eleveId: p.eleve_id, montant: p.montant, mois: p.mois, moyen: p.moyen, date: iso(p.date) });
const mapPresence = (p) => ({ classeId: p.classe_id, eleveId: p.eleve_id, date: day(p.date), statut: p.statut });
const mapDevoir = (d, rendus) => ({
  id: d.id, classeId: d.classe_id, titre: d.titre, consigne: d.consigne, dateLimite: day(d.date_limite), fichierId: d.fichier_id, fichierNom: d.fichier_nom, date: iso(d.date),
  rendus: rendus.filter((r) => r.devoir_id === d.id).map((r) => ({ eleveId: r.eleve_id, texte: r.texte, fichierId: r.fichier_id, fichierNom: r.fichier_nom, note: r.note || '', commentaire: r.commentaire || '', date: iso(r.date) })),
});
