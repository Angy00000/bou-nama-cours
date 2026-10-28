import { Link } from 'react-router-dom';
import { useData, useMe, espaceDe } from '../../data/store.js';

// Lien WhatsApp à partir d'un numéro sénégalais
export const waLien = (tel, texte = '') => {
  let n = String(tel || '').replace(/\D/g, '');
  if (n.length === 9) n = '221' + n;
  return `https://wa.me/${n}${texte ? '?text=' + encodeURIComponent(texte) : ''}`;
};

export function PubHead() {
  const site = useData((s) => s.site);
  const me = useMe();
  return (
    <header className="pub-head">
      <div className="in pad">
        <Link to="/" className="logo">{site.nom}</Link>
        <div className="row">
          {me ? (
            <Link className="btn primary sm" to={espaceDe(me)}>Mon espace</Link>
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
  const tarifs = site.tarifs || [];
  const temoignages = (site.temoignages || []).filter((t) => t.texte);
  const horaires = (site.horaires || '').split('\n').map((l) => l.trim()).filter(Boolean);
  const wa = waLien(site.whatsapp || site.tel, `Bonjour ${site.prof}, je souhaite des informations sur les cours.`);

  return (
    <>
      <PubHead />
      <section className="hero pad">
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
        <div className="feats">
          <img className="feats-img" src="/img/livres.webp" alt="Livres et ordinateur portable : les cours en ligne" loading="lazy" width="900" height="900" />
          <div className="feats-list">
          <h2>Tout pour réussir, au même endroit</h2>
          <div className="feat"><b>Cours en ligne par classe</b><p className="muted">Chaque élève retrouve les cours, fiches, exercices et sujets d’examen de sa classe, chapitre par chapitre.</p></div>
          <div className="feat"><b>Devoirs et corrections</b><p className="muted">Les devoirs se rendent en ligne, avec une note et un commentaire du professeur.</p></div>
          <div className="feat"><b>Suivi pour les parents</b><p className="muted">Les parents voient les notes, les présences et les paiements de leur enfant.</p></div>
          <div className="feat"><b>École, domicile ou en ligne</b><p className="muted">Cours en groupe à l’école, cours particuliers à domicile ou en visio, secteur {site.zone}.</p></div>
          </div>
        </div>
      </section>

      <section className="sect pad" style={{ paddingTop: 0 }}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
          <div className="card stack">
            <h2>Tarifs</h2>
            {tarifs.length ? (
              <div>{tarifs.map((t, i) => <div className="tarif" key={i}><span>{t.libelle}</span><b>{t.prix}</b></div>)}</div>
            ) : <p className="muted">Tarifs communiqués sur demande, contactez le professeur.</p>}
            <p className="muted small">Paiement mensuel en espèces, Wave ou Orange Money.</p>
          </div>
          <div className="card stack">
            <h2>Horaires et disponibilités</h2>
            {horaires.length ? <div className="list">{horaires.map((h, i) => <div className="item" key={i}><span>{h}</span></div>)}</div>
              : <p className="muted">Horaires communiqués sur demande.</p>}
            <h2 style={{ marginTop: 8 }}>Niveaux</h2>
            <p>{site.niveaux}</p>
          </div>
        </div>
      </section>

      {(site.resultats || temoignages.length > 0) && (
        <section className="sect pad" style={{ paddingTop: 0 }}>
          <h2>Résultats et témoignages</h2>
          {site.resultats && <p className="pre" style={{ maxWidth: '65ch' }}>{site.resultats}</p>}
          {temoignages.length > 0 && (
            <div className="grid">
              {temoignages.map((t, i) => (
                <figure className="card stack" key={i} style={{ margin: 0 }}>
                  <blockquote style={{ margin: 0 }}>« {t.texte} »</blockquote>
                  <figcaption className="small muted">{t.nom}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="sect pad" style={{ paddingTop: 0 }}>
        <div className="card stack contact-card">
          <h2>Contact</h2>
          <p>{site.prof} · <b>{site.tel}</b> (appel ou WhatsApp){nbEleves ? ` · ${nbEleves} élèves suivent les cours` : ''}</p>
          <div className="row">
            <a className="btn primary" href={wa} target="_blank" rel="noreferrer">Écrire sur WhatsApp</a>
            <Link className="btn ghost" style={{ color: 'var(--chalk)', borderColor: 'rgba(255,255,255,.35)' }} to="/inscription">Demander une inscription</Link>
          </div>
        </div>
      </section>
      <a className="wa-float" href={wa} target="_blank" rel="noreferrer" aria-label="Écrire sur WhatsApp">WhatsApp</a>
      <PubFoot />
    </>
  );
}
