import { useEffect, useRef, useState } from 'react';
import { useData, useMe, posterDiscussion, refresh } from '../data/store.js';
import { PageHead, Empty, fdatetime } from '../components/ui.jsx';

// Discussion de groupe : un fil par classe, visible par le prof et les élèves de la classe
export default function Discussion() {
  const s = useData();
  const me = useMe();
  const classes = me.role === 'prof' ? s.classes : s.classes.filter((c) => (me.classeIds || []).includes(c.id));
  const [classe, setClasse] = useState(classes[0]?.id);
  const [txt, setTxt] = useState('');
  const fil = s.discussions.filter((d) => d.classeId === classe);
  const nom = (id) => (id === me.id ? 'Moi' : s.users.find((u) => u.id === id)?.nom || 'Ancien élève');
  const role = (id) => s.users.find((u) => u.id === id)?.role;
  const end = useRef(null);

  useEffect(() => { refresh(); }, []);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [classe, fil.length]);

  const send = async () => {
    const t = txt.trim();
    if (!t) return;
    setTxt('');
    if (!(await posterDiscussion(classe, t))) setTxt(t);
  };

  return (
    <>
      <PageHead title="Discussion" sub="Un groupe par classe. Les messages sont visibles par toute la classe." />
      {!classes.length ? <Empty>Aucune classe pour le moment.</Empty> : (
        <>
          {classes.length > 1 && <div className="tabs">{classes.map((c) => <button key={c.id} className={classe === c.id ? 'on' : ''} onClick={() => setClasse(c.id)}>{c.nom}</button>)}</div>}
          <div className="card stack">
            <div className="bubbles" style={{ maxHeight: '58vh' }}>
              {fil.length ? fil.map((m) => (
                <div key={m.id} className={'bub' + (m.auteurId === me.id ? ' me' : '')}>
                  {m.auteurId !== me.id && <b style={{ display: 'block', fontSize: 13, color: role(m.auteurId) === 'prof' ? 'var(--accent)' : undefined }}>{nom(m.auteurId)}{role(m.auteurId) === 'prof' ? ' · Professeur' : ''}</b>}
                  {m.texte}<small>{fdatetime(m.date)}</small>
                </div>
              )) : <p className="muted small">Aucun message dans ce groupe. Écrivez le premier.</p>}
              <div ref={end} />
            </div>
            <div className="row" style={{ flexWrap: 'nowrap' }}>
              <input className="input" placeholder="Message au groupe" value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
              <button className="btn primary" disabled={!txt.trim()} onClick={send}>Envoyer</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
