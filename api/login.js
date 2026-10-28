import bcrypt from 'bcryptjs';
import { q, send, handler, body, sign, normTel, loadState } from './_lib.js';
export default handler(async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Méthode non autorisée' });
  const { tel, password } = await body(req);
  const [u] = await q('select * from users where tel = $1', [normTel(tel)]);
  if (!u || !(await bcrypt.compare(String(password || ''), u.password_hash))) return send(res, 401, { error: 'Numéro ou mot de passe incorrect.' });
  if (u.statut === 'en_attente') return send(res, 403, { error: "Votre inscription n'a pas encore été validée par le professeur." });
  if (u.statut !== 'actif') return send(res, 403, { error: "Votre compte n'est pas actif. Contactez le professeur." });
  send(res, 200, { token: await sign(u), state: await loadState(u) });
});
