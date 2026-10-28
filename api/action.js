import bcrypt from 'bcryptjs';
import { q, send, handler, auth, body, uid, normTel, loadState, fail } from './_lib.js';

const t = (v, n = 5000) => (v === undefined || v === null ? null : String(v).trim().slice(0, n) || null);
const int = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : 0);
const arr = (v) => (Array.isArray(v) ? v.map(String).slice(0, 50) : []);

// Actions réservées au professeur
const PROF = {
  async updateSite(p) { await q("update site set data = $1::jsonb where id = 1", [JSON.stringify(p)]); },

  async updateUser({ id, patch }) {
    const [u] = await q('select * from users where id = $1', [id]);
    if (!u) throw fail(404, 'Élève introuvable.');
    const m = {
      nom: t(patch.nom, 200) ?? u.nom, tel: patch.tel !== undefined ? normTel(patch.tel) : u.tel,
      statut: ['actif', 'en_attente', 'refuse'].includes(patch.statut) ? patch.statut : u.statut,
      niveau: patch.niveau !== undefined ? t(patch.niveau, 200) : u.niveau, ecole: patch.ecole !== undefined ? t(patch.ecole, 200) : u.ecole,
      parent_tel: patch.parentTel !== undefined ? normTel(patch.parentTel) || null : u.parent_tel,
      adresse: patch.adresse !== undefined ? t(patch.adresse, 300) : u.adresse,
      tarif: patch.tarif !== undefined ? int(patch.tarif) : u.tarif,
      classe_ids: patch.classeIds !== undefined ? arr(patch.classeIds) : u.classe_ids,
    };
    if (m.tel !== u.tel) {
      const [x] = await q('select 1 from users where tel = $1 and id <> $2', [m.tel, id]);
      if (x) throw fail(409, 'Ce numéro est déjà utilisé par un autre compte.');
    }
    await q(`update users set nom=$2, tel=$3, statut=$4, niveau=$5, ecole=$6, parent_tel=$7, adresse=$8, tarif=$9, classe_ids=$10 where id=$1`,
      [id, m.nom, m.tel, m.statut, m.niveau, m.ecole, m.parent_tel, m.adresse, m.tarif, m.classe_ids]);
    if (patch.password) await q('update users set password_hash = $2 where id = $1', [id, await bcrypt.hash(String(patch.password), 10)]);
  },

  async ajouterEleve(d) {
    const tel = normTel(d.tel);
    if (!t(d.nom) || tel.length < 7) throw fail(400, 'Le nom et le téléphone sont obligatoires.');
    const [x] = await q('select 1 from users where tel = $1', [tel]);
    if (x) throw fail(409, 'Ce numéro est déjà inscrit.');
    const pw = String(d.password || tel.slice(-4));
    await q(`insert into users (id, role, statut, nom, tel, password_hash, niveau, ecole, parent_tel, adresse, tarif, classe_ids)
             values ($1,'eleve','actif',$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [uid('u'), t(d.nom, 200), tel, await bcrypt.hash(pw, 10), t(d.niveau, 200), t(d.ecole, 200), normTel(d.parentTel) || null, t(d.adresse, 300), int(d.tarif), arr(d.classeIds)]);
  },
  async supprimerUser({ id }) { await q("delete from users where id = $1 and role = 'eleve'", [id]); },

  async ajouterClasse(d) { await q('insert into classes values ($1,$2,$3,$4,$5,$6)', [uid('c'), t(d.nom, 200), t(d.lieu, 50), t(d.niveau, 100), t(d.matiere, 100), t(d.couleur, 20)]); },
  async updateClasse({ id, patch: d }) { await q('update classes set nom=$2, lieu=$3, niveau=$4, matiere=$5, couleur=$6 where id=$1', [id, t(d.nom, 200), t(d.lieu, 50), t(d.niveau, 100), t(d.matiere, 100), t(d.couleur, 20)]); },
  async supprimerClasse({ id }) {
    await q('delete from classes where id = $1', [id]);
    await q('update users set classe_ids = array_remove(classe_ids, $1)', [id]);
  },

  async ajouterCours(d) {
    if (!t(d.titre)) throw fail(400, 'Donnez un titre au cours.');
    await q(`insert into cours (id, classe_id, chapitre, titre, description, type, url, contenu, fichier_id, fichier_nom) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [uid('co'), d.classeId, t(d.chapitre, 200), t(d.titre, 300), t(d.description, 500), ['fichier', 'lien', 'texte'].includes(d.type) ? d.type : 'texte', t(d.url, 1000), t(d.contenu, 50000), t(d.fichierId, 50), t(d.fichierNom, 200)]);
  },
  async supprimerCours({ id }) { await q('delete from cours where id = $1', [id]); },

  async ajouterAnnonce(d) { await q('insert into annonces (id, classe_id, texte) values ($1,$2,$3)', [uid('a'), t(d.classeId, 50) || 'tous', t(d.texte, 3000)]); },
  async supprimerAnnonce({ id }) { await q('delete from annonces where id = $1', [id]); },

  async ajouterDevoir(d) {
    await q('insert into devoirs (id, classe_id, titre, consigne, date_limite, fichier_id, fichier_nom) values ($1,$2,$3,$4,$5,$6,$7)',
      [uid('d'), d.classeId, t(d.titre, 300), t(d.consigne, 5000), d.dateLimite, t(d.fichierId, 50), t(d.fichierNom, 200)]);
  },
  async supprimerDevoir({ id }) { await q('delete from devoirs where id = $1', [id]); },
  async noterRendu({ devoirId, eleveId, patch }) {
    await q('update rendus set note = $3, commentaire = $4 where devoir_id = $1 and eleve_id = $2', [devoirId, eleveId, t(patch.note, 20), t(patch.commentaire, 2000)]);
  },

  async ajouterSeance(d) { await q('insert into seances values ($1,$2,$3,$4,$5,$6)', [uid('s'), d.classeId, int(d.jour) % 7, t(d.heure, 5), int(d.duree), t(d.lieu, 200)]); },
  async supprimerSeance({ id }) { await q('delete from seances where id = $1', [id]); },

  async ajouterPaiement(d) {
    if (!int(d.montant)) throw fail(400, 'Indiquez un montant.');
    await q('insert into paiements (id, eleve_id, montant, mois, moyen) values ($1,$2,$3,$4,$5)', [uid('p'), d.eleveId, int(d.montant), t(d.mois, 7), t(d.moyen, 50)]);
  },
  async supprimerPaiement({ id }) { await q('delete from paiements where id = $1', [id]); },
};

// Actions de tous les utilisateurs (avec contrôle d'accès)
const COMMUN = {
  async poserQuestion(d, me) {
    await coursVisible(d.coursId, me);
    await q('insert into questions (id, cours_id, auteur_id, texte) values ($1,$2,$3,$4)', [uid('q'), d.coursId, me.id, t(d.texte, 3000)]);
  },
  async repondreQuestion({ questionId, texte }, me) {
    const [x] = await q('select cours_id from questions where id = $1', [questionId]);
    if (!x) throw fail(404, 'Question introuvable.');
    await coursVisible(x.cours_id, me);
    await q('insert into reponses (id, question_id, auteur_id, texte) values ($1,$2,$3,$4)', [uid('r'), questionId, me.id, t(texte, 3000)]);
  },
  async envoyerMessage({ toId, texte }, me) {
    const [to] = await q('select role from users where id = $1', [toId]);
    if (!to) throw fail(404, 'Destinataire introuvable.');
    if (me.role !== 'prof' && to.role !== 'prof') throw fail(403, 'Vous pouvez écrire uniquement au professeur.');
    await q('insert into messages (id, from_id, to_id, texte) values ($1,$2,$3,$4)', [uid('m'), me.id, toId, t(texte, 3000)]);
  },
  async marquerLus({ autreId }, me) { await q('update messages set lu = true where to_id = $1 and from_id = $2', [me.id, autreId]); },
  async rendreDevoir(d, me) {
    if (me.role !== 'eleve') throw fail(403, 'Réservé aux élèves.');
    const [dv] = await q('select classe_id from devoirs where id = $1', [d.devoirId]);
    if (!dv || !(me.classe_ids || []).includes(dv.classe_id)) throw fail(403, 'Ce devoir ne vous concerne pas.');
    await q(`insert into rendus (devoir_id, eleve_id, texte, fichier_id, fichier_nom, date) values ($1,$2,$3,$4,$5, now())
             on conflict (devoir_id, eleve_id) do update set texte = excluded.texte, fichier_id = excluded.fichier_id, fichier_nom = excluded.fichier_nom, date = now(), note = null, commentaire = null`,
      [d.devoirId, me.id, t(d.texte, 5000), t(d.fichierId, 50), t(d.fichierNom, 200)]);
  },
  async changerMotDePasse({ password }, me) {
    if (String(password || '').length < 4) throw fail(400, 'Au moins 4 caractères.');
    await q('update users set password_hash = $2 where id = $1', [me.id, await bcrypt.hash(String(password), 10)]);
  },
};

async function coursVisible(coursId, me) {
  const [c] = await q('select classe_id from cours where id = $1', [coursId]);
  if (!c) throw fail(404, 'Cours introuvable.');
  if (me.role !== 'prof' && !(me.classe_ids || []).includes(c.classe_id)) throw fail(403, 'Ce cours ne vous concerne pas.');
}

export default handler(async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Méthode non autorisée' });
  const me = await auth(req);
  if (!me) return send(res, 401, { error: 'Session expirée. Reconnectez-vous.' });
  const { type, p = {} } = await body(req);
  const fn = COMMUN[type] || (me.role === 'prof' ? PROF[type] : null);
  if (!fn) return send(res, 403, { error: 'Action non autorisée.' });
  await fn(p, me);
  const [fresh] = await q('select * from users where id = $1', [me.id]);
  send(res, 200, { state: await loadState(fresh) });
});
