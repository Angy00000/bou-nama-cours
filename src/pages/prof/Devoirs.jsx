import { useState } from 'react';
import { useData, ajouterDevoir, supprimerDevoir, noterRendu, elevesDeClasse, saveFile } from '../../data/store.js';
import { PageHead, Empty, Modal, Field, ClasseTag, FichierLien, fdate, Confirm } from '../../components/ui.jsx';

export default function Devoirs() {
  const s = useData();
  const [add, setAdd] = useState(false);
  const [open, setOpen] = useState(null);
  const devoir = s.devoirs.find((d) => d.id === open);
  return (
    <>
      <PageHead title="Devoirs" sub="Donnez un devoir à une classe, puis corrigez les copies rendues.">
        <button className="btn primary" disabled={!s.classes.length} onClick={() => setAdd(true)}>Nouveau devoir</button>
      </PageHead>
      {s.devoirs.length ? (
        <div className="grid">
          {s.devoirs.map((d) => {
            const total = elevesDeClasse(s, d.classeId).length;
            const aCorriger = d.rendus.filter((r) => !r.note).length;
            const passe = d.dateLimite < new Date().toISOString().slice(0, 10);
            return (
              <button key={d.id} className="card stack" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => setOpen(d.id)}>
                <ClasseTag classe={s.classes.find((c) => c.id === d.classeId)} />
                <h3>{d.titre}</h3>
                <div className="row">
                  <span className={'badge ' + (passe ? 'err' : '')}>Pour le {fdate(d.dateLimite)}</span>
                  <span className="badge">{d.rendus.length}/{total} rendus</span>
                  {aCorriger > 0 && <span className="badge warn">{aCorriger} à corriger</span>}
                </div>
              </button>
            );
          })}
        </div>
      ) : <Empty>Aucun devoir pour le moment.</Empty>}
      {add && <DevoirForm classes={s.classes} onClose={() => setAdd(false)} />}
      {devoir && <Correction d={devoir} s={s} onClose={() => setOpen(null)} />}
    </>
  );
}

function DevoirForm({ classes, onClose }) {
  const [f, setF] = useState({ classeId: classes[0].id, titre: '', consigne: '', dateLimite: '' });
  const [file, setFile] = useState(null);
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async () => {
    if (!f.titre.trim() || !f.dateLimite) return;
    const extra = file ? await saveFile(file) : {};
    ajouterDevoir({ ...f, ...extra });
    onClose();
  };
  return (
    <Modal title="Nouveau devoir" onClose={onClose}>
      <div className="stack">
        <div className="form2">
          <Field label="Classe"><select className="input" value={f.classeId} onChange={up('classeId')}>{classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}</select></Field>
          <Field label="À rendre pour le"><input className="input" type="date" value={f.dateLimite} onChange={up('dateLimite')} /></Field>
        </div>
        <Field label="Titre"><input className="input" value={f.titre} onChange={up('titre')} /></Field>
        <Field label="Consigne"><textarea className="input" value={f.consigne} onChange={up('consigne')} /></Field>
        <Field label="Sujet en pièce jointe (facultatif)"><input className="input" type="file" onChange={(e) => setFile(e.target.files[0] || null)} /></Field>
        <button className="btn primary" disabled={!f.titre.trim() || !f.dateLimite} onClick={save}>Donner le devoir</button>
      </div>
    </Modal>
  );
}

function Correction({ d, s, onClose }) {
  const eleves = elevesDeClasse(s, d.classeId);
  return (
    <Modal title={d.titre} onClose={onClose}>
      <div className="stack">
        <p className="pre">{d.consigne}</p>
        {d.fichierId && <div><FichierLien fichierId={d.fichierId} fichierNom={d.fichierNom} /></div>}
        <h3>Copies ({d.rendus.length}/{eleves.length})</h3>
        <div className="list">
          {eleves.map((e) => {
            const r = d.rendus.find((x) => x.eleveId === e.id);
            return <Copie key={e.id} e={e} r={r} d={d} />;
          })}
        </div>
        <Confirm label="Supprimer ce devoir" onYes={() => { supprimerDevoir(d.id); onClose(); }} />
      </div>
    </Modal>
  );
}

function Copie({ e, r, d }) {
  const [note, setNote] = useState(r?.note || '');
  const [com, setCom] = useState(r?.commentaire || '');
  if (!r) return <div className="item"><b>{e.nom}</b><span className="badge">Pas rendu</span></div>;
  return (
    <div className="item" style={{ display: 'grid', gap: 8 }}>
      <div className="row between"><b>{e.nom}</b><span className="small muted">Rendu le {fdate(r.date)}</span></div>
      {r.texte && <p className="pre small">{r.texte}</p>}
      {r.fichierId && <div><FichierLien fichierId={r.fichierId} fichierNom={r.fichierNom} /></div>}
      <div className="row" style={{ flexWrap: 'nowrap' }}>
        <input className="input" style={{ width: 90 }} placeholder="Note /20" value={note} onChange={(x) => setNote(x.target.value)} />
        <input className="input" placeholder="Commentaire" value={com} onChange={(x) => setCom(x.target.value)} />
        <button className="btn sm dark" onClick={() => noterRendu(d.id, e.id, { note, commentaire: com })}>OK</button>
      </div>
      {r.note && <span className="badge ok" style={{ justifySelf: 'start' }}>Corrigé : {r.note}</span>}
    </div>
  );
}
