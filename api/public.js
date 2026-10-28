import { q, send, handler } from './_lib.js';
export default handler(async (req, res) => {
  const [site] = await q('select data from site where id = 1');
  const [n] = await q("select count(*)::int as n from users where role = 'eleve' and statut = 'actif'");
  send(res, 200, { site: site?.data || {}, nbEleves: n.n });
});
