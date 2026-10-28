import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData, useMe } from '../../data/store.js';
import { PageHead, Empty } from '../../components/ui.jsx';
import { Fil } from '../CoursDetail.jsx';

export default function Questions() {
  const s = useData();
  const me = useMe();
  const [tab, setTab] = useState('attente');
  const nom = (id) => s.users.find((u) => u.id === id)?.nom || 'Ancien élève';
  const list = s.questions
    .filter((q) => (tab === 'attente' ? !q.reponses.length : true))
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageHead title="Questions" sub="Questions posées par les élèves sous les cours." />
      <div className="tabs">
        <button className={tab === 'attente' ? 'on' : ''} onClick={() => setTab('attente')}>Sans réponse</button>
        <button className={tab === 'toutes' ? 'on' : ''} onClick={() => setTab('toutes')}>Toutes</button>
      </div>
      {list.length ? list.map((q) => {
        const c = s.cours.find((x) => x.id === q.coursId);
        return (
          <div key={q.id} className="stack" style={{ gap: 6 }}>
            {c && <Link to={`/prof/cours/${c.id}`} className="small muted">Sur : {c.titre}</Link>}
            <Fil q={q} nom={nom} me={me} />
          </div>
        );
      }) : <Empty>{tab === 'attente' ? 'Toutes les questions ont une réponse.' : 'Aucune question pour le moment.'}</Empty>}
    </>
  );
}
