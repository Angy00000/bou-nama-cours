import { q, send, handler, auth } from './_lib.js';
export default handler(async (req, res) => {
  const me = await auth(req);
  if (!me) return send(res, 401, { error: 'Session expirée. Reconnectez-vous.' });
  const id = new URL(req.url, 'http://x').searchParams.get('id');
  const [f] = await q("select id, nom, type, owner_id, encode(data, 'base64') as b64 from fichiers where id = $1", [id]);
  if (!f) return send(res, 404, { error: 'Fichier introuvable.' });
  if (me.role !== 'prof' && f.owner_id !== me.id) {
    const cls = me.classe_ids || [];
    const [ok] = await q(`select 1 from cours where fichier_id = $1 and classe_id = any($2)
                          union select 1 from devoirs where fichier_id = $1 and classe_id = any($2)`, [id, cls]);
    if (!ok) return send(res, 403, { error: 'Accès refusé.' });
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', f.type || 'application/octet-stream');
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(f.nom)}`);
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.end(Buffer.from(f.b64, 'base64'));
});
