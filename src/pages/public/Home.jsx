import { Link } from 'react-router-dom';
import { useData, useMe } from '../../data/store.js';

export function PubHead() {
  const site = useData((s) => s.site);
  const me = useMe();
  return (
    <header className="pub-head">
      <div className="in pad">
        <Link to="/" className="logo">{site.nom}</Link>
        <div className="row">
          {me ? (
            <Link className="btn primary sm" to={me.role === 'prof' ? '/prof' : '/eleve'}>Mon espace</Link>
          ) : (
            <>
              <Link className="btn sm ghost" style={{ color: 'var(--chalk)', borderColor: 'rgba(255,255,255,.3)' }} to="/connexion">Se connecter</Link>
              <Link className="btn primary sm" to="/inscription">S’inscrire</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PubFoot() {
  const site = useData((s) => s.site);
  return <footer className="pub-foot pad">{site.nom} · {site.prof} · {site.tel} · {site.zone}</footer>;
}

export default function Home() {
  const site = useData((s) => s.site);
  const nbEleves = useData((s) => s.nbEleves);
  return (
    <>
      <PubHead />
      <section className="hero pad">
        <div className="formula" aria-hidden="true">f(x) = ax² + bx + c</div>
        <div className="in">
          <span className="small" style={{ letterSpacing: '.1em', textTransform: 'uppercase', opacity: .75 }}>{site.matieres}</span>
          <h1>{site.slogan}</h1>
          <p>{site.apropos}</p>
          <div className="row">
            <Link className="btn primary" to="/inscription">Inscrire un élève</Link>
            <Link className="btn ghost" style={{ color: 'var(--chalk)', borderColor: 'rgba(255,255,255,.35)' }} to="/connexion">Accéder à mes cours</Link>
          </div>
        </div>
      </section>

      <section className="sect pad">
        <div className="grid">
          <div className="feat"><b>Cours en ligne par classe</b><p className="muted">Chaque élève retrouve les cours, fiches et exercices de sa classe, chapitre par chapitre.</p></div>
          <div className="feat"><b>Devoirs et corrections</b><p className="muted">Les devoirs se rendent en ligne, avec une note et un commentaire du professeur.</p></div>
          <div className="feat"><b>Questions au professeur</b><p className="muted">Une question sur un cours ? L’élève la pose directement sous le chapitre.</p></div>
          <div className="feat"><b>École, domicile ou en ligne</b><p className="muted">Cours en groupe à l’école ou cours particuliers à domicile ({site.zone}).</p></div>
        </div>
      </section>

      <section className="sect pad" style={{ paddingTop: 0 }}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
          <div className="card stack">
            <h2>Tarifs</h2>
            <div>
              {site.tarifs.map((t, i) => (
                <div className="tarif" key={i}><span>{t.libelle}</span><b>{t.prix}</b></div>
              ))}
            </div>
            <p className="muted small">Paiement en espèces, Wave ou Orange Money.</p>
          </div>
          <div className="card stack">
            <h2>Niveaux</h2>
            <p>{site.niveaux}</p>
            <h2 style={{ marginTop: 8 }}>Contact</h2>
            <p>{site.prof} · <b>{site.tel}</b> (appel ou WhatsApp)</p>
            <p className="muted small">{nbEleves} élèves suivent actuellement les cours.</p>
            <Link className="btn dark" to="/inscription">Demander une inscription</Link>
          </div>
        </div>
      </section>
      <PubFoot />
    </>
  );
}
