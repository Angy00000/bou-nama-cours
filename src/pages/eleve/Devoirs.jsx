import { useState } from 'react';
import { useData, useMe, rendreDevoir, saveFile } from '../../data/store.js';
import { PageHead, Empty, ClasseTag, FichierLien, fdate } from '../../components/ui.jsx';

export default function Devoirs() {
  const s = useData();
  const me = useMe();
  const list = s.devoirs.filter((d) => (me.classeIds || []).includes(d.classeId)).sort((a, b) => a.dateLimite.localeCompare(b.dateLimite));
  return (
    <>
      <PageHead title="Devoirs" />
      {list.length ? list.map((d) => <Devoir key={d.id} d={d} me={me} classe={s.classes.find((c) => c.id === d.classeId)} />)
        : <Empty>Aucun devoir pour le moment.</Empty>}
    </>
  );
}

function Devoir({ d, me, classe }) {
  const r = d.rendus.find((x) => x.eleveId === me.id);
  const [txt, setTxt] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false);
  const passe = d.dateLimite < new Date().toISOString().slice(0, 10);
  const envoyer = async () => {
    setBusy(true);
    const extra = file ? await saveFile(file) : {};
    rendreDevoir(d.id, { eleveId: me.id, texte: txt.trim(), ...extra });
    setBusy(false); setEdit(false); setTxt(''); setFile(null);
  };
  return (
    <div className="card stack">
      <div className="row between">
        <ClasseTag classe={classe} />
        {r ? (r.note ? <span className="badge ok">Note : {r.note}</span> : <span className="badge ok">Rendu</span>)
          : <span className={'badge ' + (passe ? 'err' : 'warn')}>Pour le {fdate(d.dateLimite)}</span>}
      </div>
      <h3>{d.titre}</h3>
      <p className="pre">{d.consigne}</p>
      {d.fichierId && <div><FichierLien fichierId={d.fichierId} fichierNom={d.fichierNom} /></div>}
      {r && !edit && (
        <div className="stack" style={{ gap: 6, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
          <span className="small muted">Rendu le {fdate(r.date)}</span>
          {r.texte && <p className="pre small">{r.texte}</p>}
          {r.fichierId && <div><FichierLien fichierId={r.fichierId} fichierNom={r.fichierNom} /></div>}
          {r.commentaire && <p style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 10 }}><b>Professeur :</b> {r.commentaire}</p>}
          {!r.note && <button className="btn sm ghost" style={{ justifySelf: 'start' }} onClick={() => setEdit(true)}>Renvoyer une autre version</button>}
        </div>
      )}
      {(!r || edit) && (
        <div className="stack" style={{ gap: 8, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
          <textarea className="input" placeholder="Votre réponse ou un message pour le professeur" value={txt} onChange={(e) => setTxt(e.target.value)} />
          <input className="input" type="file" accept="image/*,.pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0] || null)} />
          <span className="small muted">Astuce : prenez votre copie en photo avec le téléphone.</span>
          <button className="btn primary" style={{ justifySelf: 'start' }} disabled={busy || (!txt.trim() && !file)} onClick={envoyer}>{busy ? 'Envoi…' : 'Rendre le devoir'}</button>
        </div>
      )}
    </div>
  );
}
