import { useState } from 'react';
import { useData, updateUser } from '../../data/store.js';
import { PageHead, Empty, fdate, Field } from '../../components/ui.jsx';

export default function Inscriptions() {
  const s = useData();
  const attente = s.users.filter((u) => u.statut === 'en_attente');
  return (
    <>
      <PageHead title="Inscriptions" sub="Demandes reçues depuis le site. Choisissez la classe puis validez." />
      {attente.length ? (
        <div className="grid">{attente.map((u) => <Demande key={u.id} u={u} classes={s.classes} />)}</div>
      ) : <Empty>Aucune demande en attente. Les nouvelles inscriptions apparaîtront ici.</Empty>}
    </>
  );
}

function Demande({ u, classes }) {
  const [cls, setCls] = useState([]);
  const [tarif, setTarif] = useState('');
  const toggle = (id) => setCls(cls.includes(id) ? cls.filter((x) => x !== id) : [...cls, id]);
  return (
    <div className="card stack">
      <div className="row between"><h3>{u.nom}</h3><span className="badge warn">En attente</span></div>
      <div className="small stack" style={{ gap: 2 }}>
        <span>Classe : <b>{u.niveau}</b>{u.ecole ? ` · ${u.ecole}` : ''}</span>
        <span>Tél. : {u.tel}{u.parentTel ? ` · Parent : ${u.parentTel}` : ''}</span>
        {u.matieresVoulues && <span>Matières : {u.matieresVoulues}</span>}
        <span>Type : {u.lieuVoulu}{u.adresse ? ` · ${u.adresse}` : ''}</span>
        <span className="muted">Demande du {fdate(u.creeLe)}</span>
      </div>
      <Field label="Placer dans">
        <div className="chk">
          {classes.map((c) => (
            <label key={c.id}><input type="checkbox" checked={cls.includes(c.id)} onChange={() => toggle(c.id)} />{c.nom}</label>
          ))}
        </div>
      </Field>
      <Field label="Tarif mensuel (FCFA)"><input className="input" inputMode="numeric" value={tarif} onChange={(e) => setTarif(e.target.value.replace(/\D/g, ''))} placeholder="15000" /></Field>
      <div className="row">
        <button className="btn primary" disabled={!cls.length} onClick={() => updateUser(u.id, { statut: 'actif', classeIds: cls, tarif: Number(tarif) || 0 })}>Valider</button>
        <button className="btn danger" onClick={() => updateUser(u.id, { statut: 'refuse' })}>Refuser</button>
      </div>
    </div>
  );
}
