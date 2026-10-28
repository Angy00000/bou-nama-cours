import { Link } from 'react-router-dom';
import { useData, useMe } from '../../data/store.js';
import { PageHead, ClasseTag, fdate, fdatetime, JOURS } from '../../components/ui.jsx';

export default function Accueil() {
  const s = useData();
  const me = useMe();
  const mesClasses = me.classeIds || [];
  const annonces = s.annonces.filter((a) => a.classeId === 'tous' || mesClasses.includes(a.classeId)).slice(0, 5);
  const cours = s.cours.filter((c) => mesClasses.includes(c.classeId)).slice(0, 4);
  const devoirs = s.devoirs.filter((d) => mesClasses.includes(d.classeId) && !d.rendus.some((r) => r.eleveId === me.id));
  const seances = s.seances.filter((x) => mesClasses.includes(x.classeId)).sort((a, b) => ((a.jour + 6) % 7) - ((b.jour + 6) % 7) || a.heure.localeCompare(b.heure));
  const cl = (id) => s.classes.find((c) => c.id === id);

  return (
    <>
      <PageHead title={`Bonjour ${me.nom.split(' ')[0]}`} sub={mesClasses.map((id) => cl(id)?.nom).filter(Boolean).join(' · ')} />
      {devoirs.length > 0 && (
        <Link to="/eleve/devoirs" className="card row between" style={{ textDecoration: 'none', borderColor: 'var(--accent)' }}>
          <span><b style={{ color: 'var(--accent)' }}>{devoirs.length}</b> devoir(s) à rendre · le prochain pour le {fdate(devoirs.map((d) => d.dateLimite).sort()[0])}</span>
          <span>›</span>
        </Link>
      )}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
        <div className="card stack">
          <h2>Annonces</h2>
          {annonces.length ? <div className="list">{annonces.map((a) => (
            <div className="item" key={a.id}><div className="grow stack" style={{ gap: 4 }}><span className="small muted">{fdatetime(a.date)}</span><p>{a.texte}</p></div></div>
          ))}</div> : <p className="muted">Aucune annonce.</p>}
        </div>
        <div className="card stack">
          <h2>Mes séances</h2>
          {seances.length ? <div className="list">{seances.map((x) => (
            <div className="item" key={x.id}>
              <div className="grow"><b>{JOURS[x.jour]} {x.heure}</b><div className="small muted">{x.lieu}</div></div>
              <ClasseTag classe={cl(x.classeId)} />
            </div>
          ))}</div> : <p className="muted">Pas encore de séance planifiée.</p>}
        </div>
      </div>
      <div className="card stack">
        <div className="row between"><h2>Nouveaux cours</h2><Link className="small" to="/eleve/cours">Tous mes cours</Link></div>
        {cours.length ? <div className="list">{cours.map((c) => (
          <Link key={c.id} to={`/eleve/cours/${c.id}`} className="item" style={{ textDecoration: 'none' }}>
            <div className="grow"><b>{c.titre}</b><div className="small muted">{c.chapitre}</div></div>
            <span className="small muted">{fdate(c.date)}</span>
          </Link>
        ))}</div> : <p className="muted">Aucun cours publié pour vos classes.</p>}
      </div>
    </>
  );
}
