import { send, handler, auth, loadState } from './_lib.js';
export default handler(async (req, res) => {
  const me = await auth(req);
  if (!me) return send(res, 401, { error: 'Session expirée. Reconnectez-vous.' });
  send(res, 200, { state: await loadState(me) });
});
