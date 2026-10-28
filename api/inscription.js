import bcrypt from 'bcryptjs';
import { q, send, handler, body, uid, normTel } from './_lib.js';
const s = (v, n = 200) => String(v || '').trim().slice(0, n) || null;
export default handler(async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Méthode non autorisée' });
  const d = await body(req);
  const tel = normTel(d.tel);
  if (!s(d.nom) || tel.length < 7 || !s(d.niveau)) return send(res, 400, { error: 'Le nom, le téléphone et la classe sont obligatoires.' });
  if (String(d.password || '').length < 4) return send(res, 400, { error: 'Choisissez un mot de passe d’au moins 4 caractères.' });
  const [exist] = await q('select id from users where tel = $1', [tel]);
  if (exist) return send(res, 409, { error: 'Ce numéro est déjà inscrit. Connectez-vous ou contactez le professeur.' });
  await q(`insert into users (id, role, statut, nom, tel, password_hash, niveau, ecole, parent_tel, adresse, matieres_voulues, lieu_voulu)
           values ($1,'eleve','en_attente',$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [uid('u'), s(d.nom), tel, await bcrypt.hash(String(d.password), 10), s(d.niveau), s(d.ecole), normTel(d.parentTel) || null, s(d.adresse), s(d.matieresVoulues), s(d.lieuVoulu, 20)]);
  send(res, 200, { ok: true });
});
