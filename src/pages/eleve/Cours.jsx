import { useState } from 'react';
import { useData, useMe } from '../../data/store.js';
import { PageHead, Empty } from '../../components/ui.jsx';
import CoursList from '../../components/CoursList.jsx';

export default function Cours() {
  const s = useData();
  const me = useMe();
  const mes = s.classes.filter((c) => (me.classeIds || []).includes(c.id));
  const [classe, setClasse] = useState(mes[0]?.id);
  const cours = s.cours.filter((c) => c.classeId === classe);
  return (
    <>
      <PageHead title="Mes cours" />
      {mes.length > 1 && (
        <div className="tabs">{mes.map((c) => <button key={c.id} className={classe === c.id ? 'on' : ''} onClick={() => setClasse(c.id)}>{c.nom}</button>)}</div>
      )}
      {!mes.length ? <Empty>Vous n’êtes encore dans aucune classe. Le professeur va vous y ajouter.</Empty>
        : cours.length ? <CoursList cours={cours} base="/eleve/cours" questions={s.questions} />
        : <Empty>Aucun cours publié pour le moment.</Empty>}
    </>
  );
}
