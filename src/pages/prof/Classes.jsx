import { useState } from 'react';
import { useData, ajouterClasse, updateClasse, supprimerClasse, elevesDeClasse } from '../../data/store.js';
import { PageHead, Empty, Modal, Field, Confirm } from '../../components/ui.jsx';

const COULEURS = ['#2f6f62', '#c0832a', '#6b5fa8', '#b0503e', '#2f6390', '#7a7d2a'];

export default function Classes() {
  const s = useData();
  const [edit, setEdit] = useState(null);
  return (
    <>
      <PageHead title="Classes" sub="Un groupe d’élèves qui partagent les mêmes cours.">
        <button className="btn primary" onClick={() => setEdit({})}>Nouvelle classe</button>
      </PageHead>
      {s.classes.length ? (
        <div className="grid">
          {s.classes.map((c) => {
            const el = elevesDeClasse(s, c.id);
            const nbCours = s.cours.filter((x) => x.classeId === c.id).length;
            return (
              <div className="card stack" key={c.id} style={{ borderTop: `4px solid ${c.couleur}` }}>
                <div className="row between"><h3>{c.nom}</h3><span className="badge">{c.lieu}</span></div>
                <p className="small muted">{c.matiere} · {c.niveau}</p>
                <p className="small"><b>{el.length}</b> élèves · <b>{nbCours}</b> cours publiés</p>
                <p className="small muted" style={{ minHeight: 20 }}>{el.map((e) => e.nom).join(', ') || 'Aucun élève pour le moment'}</p>
                <div><button className="btn sm ghost" onClick={() => setEdit(c)}>Modifier</button></div>
              </div>
            );
          })}
        </div>
      ) : <Empty>Créez votre première classe pour commencer à publier des cours.</Empty>}
      {edit && <ClasseForm c={edit} onClose={() => setEdit(null)} />}
    </>
  );
}

function ClasseForm({ c, onClose }) {
  const isNew = !c.id;
  const [f, setF] = useState({ nom: '', lieu: 'École', niveau: '', matiere: '', couleur: COULEURS[0], ...c });
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = () => {
    if (!f.nom.trim()) return;
    isNew ? ajouterClasse(f) : updateClasse(c.id, f);
    onClose();
  };
  return (
    <Modal title={isNew ? 'Nouvelle classe' : 'Modifier la classe'} onClose={onClose}>
      <div className="stack">
        <Field label="Nom de la classe"><input className="input" value={f.nom} onChange={up('nom')} placeholder="Ex. Terminale S – Maths" /></Field>
        <div className="form2">
          <Field label="Matière"><input className="input" value={f.matiere} onChange={up('matiere')} /></Field>
          <Field label="Niveau"><input className="input" value={f.niveau} onChange={up('niveau')} /></Field>
        </div>
        <Field label="Lieu">
          <select className="input" value={f.lieu} onChange={up('lieu')}><option>École</option><option>Domicile</option><option>En ligne</option></select>
        </Field>
        <Field label="Couleur">
          <div className="row">{COULEURS.map((k) => (
            <button key={k} type="button" aria-label={k} onClick={() => setF({ ...f, couleur: k })}
              style={{ width: 30, height: 30, borderRadius: '50%', background: k, border: f.couleur === k ? '3px solid var(--ink)' : '3px solid transparent', cursor: 'pointer' }} />
          ))}</div>
        </Field>
        <div className="row between">
          <button className="btn primary" onClick={save}>Enregistrer</button>
          {!isNew && <Confirm label="Supprimer la classe" onYes={() => { supprimerClasse(c.id); onClose(); }} />}
        </div>
      </div>
    </Modal>
  );
}
