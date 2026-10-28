import { useState } from 'react';
import { useData, ajouterAnnonce, supprimerAnnonce } from '../../data/store.js';
import { PageHead, Empty, ClasseTag, fdatetime, Confirm } from '../../components/ui.jsx';

export default function Annonces() {
  const s = useData();
  const [classeId, setClasseId] = useState('tous');
  const [texte, setTexte] = useState('');
  return (
    <>
      <PageHead title="Annonces" sub="Un message visible par toute une classe, ou par tous les élèves." />
      <div className="card stack">
        <select className="input" style={{ maxWidth: 320 }} value={classeId} onChange={(e) => setClasseId(e.target.value)}>
          <option value="tous">Tous les élèves</option>
          {s.classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <textarea className="input" placeholder="Ex. Contrôle samedi à 10h, révisez le chapitre 3." value={texte} onChange={(e) => setTexte(e.target.value)} />
        <button className="btn primary" style={{ justifySelf: 'start' }} disabled={!texte.trim()} onClick={() => { ajouterAnnonce({ classeId, texte: texte.trim() }); setTexte(''); }}>Publier l’annonce</button>
      </div>
      {s.annonces.length ? (
        <div className="card list" style={{ padding: '0 16px' }}>
          {s.annonces.map((a) => (
            <div className="item" key={a.id}>
              <div className="grow stack" style={{ gap: 4 }}>
                <div className="row"><ClasseTag classe={s.classes.find((c) => c.id === a.classeId)} /><span className="small muted">{fdatetime(a.date)}</span></div>
                <p>{a.texte}</p>
              </div>
              <Confirm onYes={() => supprimerAnnonce(a.id)} />
            </div>
          ))}
        </div>
      ) : <Empty>Aucune annonce publiée.</Empty>}
    </>
  );
}
