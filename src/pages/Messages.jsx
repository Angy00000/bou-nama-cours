import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData, useMe, envoyerMessage, marquerLus } from '../data/store.js';
import { PageHead, Empty, fdatetime } from '../components/ui.jsx';

export default function Messages() {
  const s = useData();
  const me = useMe();
  const [params] = useSearchParams();
  const prof = s.users.find((u) => u.role === 'prof');
  const contacts = me.role === 'prof'
    ? s.users.filter((u) => u.role === 'eleve' && u.statut === 'actif')
    : [prof];
  const dernier = (id) => s.messages.filter((m) => (m.fromId === id && m.toId === me.id) || (m.toId === id && m.fromId === me.id)).at(-1);
  const sorted = [...contacts].sort((a, b) => (dernier(b.id)?.date || '').localeCompare(dernier(a.id)?.date || ''));
  const [avec, setAvec] = useState(params.get('avec') || sorted[0]?.id);
  const [txt, setTxt] = useState('');
  const fil = s.messages.filter((m) => (m.fromId === avec && m.toId === me.id) || (m.toId === avec && m.fromId === me.id));
  const nonLus = (id) => s.messages.filter((m) => m.fromId === id && m.toId === me.id && !m.lu).length;
  const end = useRef(null);

  useEffect(() => { if (avec && nonLus(avec)) marquerLus(me.id, avec); }, [avec, fil.length]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [avec, fil.length]);

  const send = () => { if (!txt.trim()) return; envoyerMessage({ fromId: me.id, toId: avec, texte: txt.trim() }); setTxt(''); };
  const autre = contacts.find((c) => c.id === avec);

  return (
    <>
      <PageHead title="Messages" sub={me.role === 'prof' ? 'Discussions privées avec vos élèves.' : 'Discussion privée avec votre professeur.'} />
      {!contacts.length ? <Empty>Aucun élève actif pour le moment.</Empty> : (
        <div className="chat">
          {me.role === 'prof' && (
            <div className="who">
              {sorted.map((c) => (
                <button key={c.id} className={c.id === avec ? 'on' : ''} onClick={() => setAvec(c.id)}>
                  <span>{c.nom}</span>{nonLus(c.id) ? <span className="badge warn">{nonLus(c.id)}</span> : null}
                </button>
              ))}
            </div>
          )}
          <div className="card stack" style={{ gridColumn: me.role === 'prof' ? undefined : '1 / -1' }}>
            <h3>{autre?.nom}</h3>
            <div className="bubbles">
              {fil.length ? fil.map((m) => (
                <div key={m.id} className={'bub' + (m.fromId === me.id ? ' me' : '')}>{m.texte}<small>{fdatetime(m.date)}</small></div>
              )) : <p className="muted small">Aucun message. Écrivez le premier.</p>}
              <div ref={end} />
            </div>
            <div className="row" style={{ flexWrap: 'nowrap' }}>
              <input className="input" placeholder="Votre message" value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
              <button className="btn primary" disabled={!txt.trim()} onClick={send}>Envoyer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
