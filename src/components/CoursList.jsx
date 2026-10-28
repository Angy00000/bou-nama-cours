import { Link } from 'react-router-dom';
import { fdate } from './ui.jsx';

const ICON = { fichier: 'Fichier', lien: 'Lien', texte: 'Fiche' };

// Cours regroupés par chapitre, du plus récent au plus ancien
export default function CoursList({ cours, base, questions = [] }) {
  const chapitres = [];
  for (const c of cours) {
    let ch = chapitres.find((x) => x.nom === c.chapitre);
    if (!ch) chapitres.push((ch = { nom: c.chapitre || 'Sans chapitre', items: [] }));
    ch.items.push(c);
  }
  return (
    <div className="stack">
      {chapitres.map((ch) => (
        <div key={ch.nom} className="stack" style={{ gap: 8 }}>
          <h3 className="muted" style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '.06em' }}>{ch.nom}</h3>
          <div className="card list" style={{ padding: '0 16px' }}>
            {ch.items.map((c) => {
              const nq = questions.filter((q) => q.coursId === c.id).length;
              return (
                <Link key={c.id} to={`${base}/${c.id}`} className="item" style={{ textDecoration: 'none' }}>
                  <div className="grow">
                    <b>{c.titre}</b>
                    {c.description && <div className="small muted">{c.description}</div>}
                  </div>
                  <div className="stack" style={{ gap: 4, justifyItems: 'end' }}>
                    <span className="badge">{ICON[c.type] || 'Cours'}</span>
                    <span className="small muted">{fdate(c.date)}{nq ? ` · ${nq} question${nq > 1 ? 's' : ''}` : ''}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
