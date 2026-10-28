import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData, updateUser, ajouterEleve, supprimerUser, statutPaiement, normTel } from '../../data/store.js';
import { PageHead, Empty, Modal, Field, PaiementBadge, ClasseTag, Confirm } from '../../components/ui.jsx';

export default function Eleves() {
  const s = useData();
  const [q, setQ] = useState('');
  const [filtre, setFiltre] = useState('tous');
  const [edit, setEdit] = useState(null);
  const eleves = s.users
    .filter((u) => u.role === 'eleve' && u.statut === 'actif')
    .filter((u) => filtre === 'tous' || (u.classeIds || []).includes(filtre))
    .filter((u) => !q || (u.nom + u.tel).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.nom.localeCompare(b.nom));

  return (
    <>
      <PageHead title="Élèves" sub={`${eleves.length} élève(s)`}>
        <button className="btn primary" onClick={() => setEdit({})}>Ajouter un élève</button>
      </PageHead>
      <div className="row">
        <input className="input" style={{ maxWidth: 280 }} placeholder="Rechercher un nom ou un numéro" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="tabs">
          <button className={filtre === 'tous' ? 'on' : ''} onClick={() => setFiltre('tous')}>Toutes</button>
          {s.classes.map((c) => <button key={c.id} className={filtre === c.id ? 'on' : ''} onClick={() => setFiltre(c.id)}>{c.nom}</button>)}
        </div>
      </div>
      {eleves.length ? (
        <div className="card tablewrap">
          <table>
            <thead><tr><th>Élève</th><th>Classe(s)</th><th>Téléphone</th><th>Parent</th><th>Ce mois</th><th></th></tr></thead>
            <tbody>
              {eleves.map((u) => (
                <tr key={u.id}>
                  <td><b>{u.nom}</b><div className="small muted">{u.niveau}{u.ecole ? ' · ' + u.ecole : ''}</div></td>
                  <td><div className="stack" style={{ gap: 4 }}>{(u.classeIds || []).map((id) => <ClasseTag key={id} classe={s.classes.find((c) => c.id === id)} />)}</div></td>
                  <td>{u.tel}</td>
                  <td>{u.parentTel || '—'}</td>
                  <td><PaiementBadge etat={statutPaiement(s, u).etat} /></td>
                  <td className="row" style={{ flexWrap: 'nowrap' }}>
                    <button className="btn sm ghost" onClick={() => setEdit(u)}>Modifier</button>
                    <Link className="btn sm ghost" to={`/prof/messages?avec=${u.id}`}>Message</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty>Aucun élève pour ce filtre.</Empty>}
      {edit && <EleveForm u={edit} classes={s.classes} onClose={() => setEdit(null)} />}
    </>
  );
}

function EleveForm({ u, classes, onClose }) {
  const isNew = !u.id;
  const [f, setF] = useState({ nom: '', tel: '', parentTel: '', niveau: '', ecole: '', adresse: '', tarif: '', password: '', classeIds: [], ...u });
  const [err, setErr] = useState('');
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggle = (id) => setF({ ...f, classeIds: f.classeIds.includes(id) ? f.classeIds.filter((x) => x !== id) : [...f.classeIds, id] });
  const save = () => {
    if (!f.nom.trim() || !f.tel.trim()) return setErr('Le nom et le téléphone sont obligatoires.');
    const data = { ...f, tel: normTel(f.tel), tarif: Number(f.tarif) || 0 };
    if (isNew) {
      if (!data.password) data.password = data.tel.slice(-4);
      ajouterEleve(data);
    } else updateUser(u.id, data);
    onClose();
  };
  return (
    <Modal title={isNew ? 'Nouvel élève' : u.nom} onClose={onClose}>
      <div className="stack">
        <Field label="Nom et prénom"><input className="input" value={f.nom} onChange={up('nom')} /></Field>
        <div className="form2">
          <Field label="Téléphone (identifiant)"><input className="input" inputMode="tel" value={f.tel} onChange={up('tel')} /></Field>
          <Field label="Téléphone parent"><input className="input" inputMode="tel" value={f.parentTel} onChange={up('parentTel')} /></Field>
        </div>
        <div className="form2">
          <Field label="Classe à l’école"><input className="input" value={f.niveau} onChange={up('niveau')} /></Field>
          <Field label="École"><input className="input" value={f.ecole} onChange={up('ecole')} /></Field>
        </div>
        <div className="form2">
          <Field label="Adresse (domicile)"><input className="input" value={f.adresse || ''} onChange={up('adresse')} /></Field>
          <Field label="Tarif mensuel (FCFA)"><input className="input" inputMode="numeric" value={f.tarif} onChange={up('tarif')} /></Field>
        </div>
        <Field label="Mot de passe" hint={isNew ? 'Vide : les 4 derniers chiffres du téléphone.' : 'Changez-le si l’élève l’a oublié.'}>
          <input className="input" value={f.password} onChange={up('password')} />
        </Field>
        <Field label="Classes sur la plateforme">
          <div className="chk">{classes.map((c) => <label key={c.id}><input type="checkbox" checked={f.classeIds.includes(c.id)} onChange={() => toggle(c.id)} />{c.nom}</label>)}</div>
        </Field>
        {err && <p className="err">{err}</p>}
        <div className="row between">
          <button className="btn primary" onClick={save}>Enregistrer</button>
          {!isNew && <Confirm label="Retirer l’élève" onYes={() => { supprimerUser(u.id); onClose(); }} />}
        </div>
      </div>
    </Modal>
  );
}
