import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useData, useMe, poserQuestion, repondreQuestion, supprimerCours } from '../data/store.js';
import { ClasseTag, FichierLien, fdate, fdatetime, Empty, Confirm } from '../components/ui.jsx';

export default function CoursDetail() {
  const { id } = useParams();
  const s = useData();
  const me = useMe();
  const nav = useNavigate();
  const c = s.cours.find((x) => x.id === id);
  const prof = me.role === 'prof';
  const base = prof ? '/prof/cours' : '/eleve/cours';
  const [txt, setTxt] = useState('');
  if (!c || (!prof && !(me.classeIds || []).includes(c.classeId))) return <Empty>Ce cours n’existe pas ou n’est pas disponible pour vous.</Empty>;
  const qs = s.questions.filter((q) => q.coursId === c.id);
  const nom = (uid) => s.users.find((u) => u.id === uid)?.nom || 'Ancien élève';

  return (
    <>
      <Link to={base} className="small muted">‹ Retour aux cours</Link>
      <div className="stack" style={{ gap: 6 }}>
        <span className="small muted">{c.chapitre}</span>
        <h1>{c.titre}</h1>
        <div className="row"><ClasseTag classe={s.classes.find((x) => x.id === c.classeId)} /><span className="small muted">Publié le {fdate(c.date)}</span></div>
      </div>
      <div className="card stack">
        {c.description && <p className="muted">{c.description}</p>}
        {c.type === 'texte' && <div className="pre">{c.contenu}</div>}
        {c.type === 'lien' && <a className="btn dark" href={c.url} target="_blank" rel="noreferrer" style={{ justifySelf: 'start' }}>{/youtu\.?be/.test(c.url) ? 'Regarder la vidéo' : 'Ouvrir le lien'}</a>}
        {c.type === 'fichier' && <div><FichierLien fichierId={c.fichierId} fichierNom={c.fichierNom} apercu /></div>}
        {prof && <div><Confirm label="Supprimer ce cours" onYes={() => { supprimerCours(c.id); nav(base); }} /></div>}
      </div>

      <div className="stack">
        <h2>Questions sur ce cours</h2>
        {!prof && (
          <div className="card stack">
            <textarea className="input" placeholder="Une question sur ce cours ? Toute la classe verra la réponse." value={txt} onChange={(e) => setTxt(e.target.value)} />
            <button className="btn primary" style={{ justifySelf: 'start' }} disabled={!txt.trim()} onClick={() => { poserQuestion({ coursId: c.id, auteurId: me.id, texte: txt.trim() }); setTxt(''); }}>Poser la question</button>
          </div>
        )}
        {qs.length ? qs.map((q) => <Fil key={q.id} q={q} nom={nom} me={me} />) : <Empty>Aucune question pour l’instant.</Empty>}
      </div>
    </>
  );
}

export function Fil({ q, nom, me }) {
  const [rep, setRep] = useState('');
  return (
    <div className="card stack" style={{ gap: 10 }}>
      <div><b>{nom(q.auteurId)}</b> <span className="small muted">· {fdatetime(q.date)}</span><p>{q.texte}</p></div>
      {q.reponses.map((r, i) => (
        <div key={i} style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 12 }}>
          <b>{nom(r.auteurId)}</b> <span className="small muted">· {fdatetime(r.date)}</span><p>{r.texte}</p>
        </div>
      ))}
      <div className="row" style={{ flexWrap: 'nowrap' }}>
        <input className="input" placeholder={me.role === 'prof' ? 'Répondre…' : 'Ajouter un commentaire…'} value={rep} onChange={(e) => setRep(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && rep.trim()) { repondreQuestion(q.id, { auteurId: me.id, texte: rep.trim() }); setRep(''); } }} />
        <button className="btn dark sm" disabled={!rep.trim()} onClick={() => { repondreQuestion(q.id, { auteurId: me.id, texte: rep.trim() }); setRep(''); }}>Envoyer</button>
      </div>
    </div>
  );
}
