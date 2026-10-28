import { useState } from 'react';
import { useData, ajouterSeance, supprimerSeance } from '../../data/store.js';
import { PageHead, Modal, Field, JOURS, ClasseTag, Confirm } from '../../components/ui.jsx';

const ORDRE = [1, 2, 3, 4, 5, 6, 0];

export default function Planning() {
  const s = useData();
  const [add, setAdd] = useState(false);
  const today = new Date().getDay();
  const heures = s.seances.reduce((a, x) => a + Number(x.duree || 0), 0) / 60;
  return (
    <>
      <PageHead title="Planning" sub={`Séances de la semaine · ${heures.toLocaleString('fr-FR')} h au total`}>
        <button className="btn primary" disabled={!s.classes.length} onClick={() => setAdd(true)}>Ajouter une séance</button>
      </PageHead>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
        {ORDRE.map((j) => {
          const list = s.seances.filter((x) => x.jour === j).sort((a, b) => a.heure.localeCompare(b.heure));
          return (
            <div key={j} className="card stack" style={{ gap: 10, borderColor: j === today ? 'var(--accent)' : undefined }}>
              <div className="row between"><h3>{JOURS[j]}</h3>{j === today && <span className="badge warn">Aujourd’hui</span>}</div>
              {list.length ? list.map((x) => (
                <div key={x.id} className="stack" style={{ gap: 3, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                  <div className="row between"><b style={{ fontVariantNumeric: 'tabular-nums' }}>{x.heure} · {x.duree} min</b><Confirm label="×" onYes={() => supprimerSeance(x.id)} /></div>
                  <ClasseTag classe={s.classes.find((c) => c.id === x.classeId)} />
                  <span className="small muted">{x.lieu}</span>
                </div>
              )) : <span className="small muted">Libre</span>}
            </div>
          );
        })}
      </div>
      {add && <SeanceForm classes={s.classes} onClose={() => setAdd(false)} />}
    </>
  );
}

function SeanceForm({ classes, onClose }) {
  const [f, setF] = useState({ classeId: classes[0].id, jour: 1, heure: '17:00', duree: 120, lieu: '' });
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title="Nouvelle séance" onClose={onClose}>
      <div className="stack">
        <Field label="Classe"><select className="input" value={f.classeId} onChange={up('classeId')}>{classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}</select></Field>
        <div className="form2">
          <Field label="Jour"><select className="input" value={f.jour} onChange={(e) => setF({ ...f, jour: Number(e.target.value) })}>{ORDRE.map((j) => <option key={j} value={j}>{JOURS[j]}</option>)}</select></Field>
          <Field label="Heure"><input className="input" type="time" value={f.heure} onChange={up('heure')} /></Field>
          <Field label="Durée (min)"><input className="input" type="number" value={f.duree} onChange={up('duree')} /></Field>
        </div>
        <Field label="Lieu"><input className="input" value={f.lieu} onChange={up('lieu')} placeholder="Ex. Lycée salle 12, ou chez l’élève" /></Field>
        <button className="btn primary" onClick={() => { ajouterSeance({ ...f, duree: Number(f.duree) }); onClose(); }}>Ajouter</button>
      </div>
    </Modal>
  );
}
