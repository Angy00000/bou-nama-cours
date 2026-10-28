import { q, send, handler, auth, uid } from './_lib.js';
export const config = { api: { bodyParser: false } };
const MAX = 4 * 1024 * 1024;
export default handler(async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Méthode non autorisée' });
  const me = await auth(req);
  if (!me) return send(res, 401, { error: 'Session expirée. Reconnectez-vous.' });
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > MAX) return send(res, 413, { error: 'Fichier trop lourd (4 Mo maximum).' }); chunks.push(c); }
  const data = Buffer.concat(chunks);
  if (!data.length) return send(res, 400, { error: 'Fichier vide.' });
  const nom = decodeURIComponent(req.headers['x-filename'] || 'fichier').slice(0, 200);
  const type = String(req.headers['content-type'] || 'application/octet-stream').slice(0, 100);
  const id = uid('f');
  await q("insert into fichiers (id, nom, type, taille, data, owner_id) values ($1,$2,$3,$4,decode($5,'base64'),$6)", [id, nom, type, data.length, data.toString('base64'), me.id]);
  send(res, 200, { fichierId: id, fichierNom: nom, fichierType: type, fichierTaille: data.length });
});
