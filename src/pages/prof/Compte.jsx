import { useState } from 'react';
import { useMe, updateUser, changerMotDePasse } from '../../data/store.js';
import { PageHead, Field } from '../../components/ui.jsx';

export default function CompteProf() {
  const me = useMe();
  const [f, setF] = useState({ nom: me.nom, tel: me.tel });
  const [okInfo, setOkInfo] = useState(false);
  const [pw, setPw] = useState({ a: '', b: '' });
  const [okPw, setOkPw] = useState(false);
  const [err, setErr] = useState('');

  const saveInfo = async () => {
    setOkInfo(false);
    if (await updateUser(me.id, { nom: f.nom, tel: f.tel })) setOkInfo(true);
  };
  const savePw = async () => {
    setErr(''); setOkPw(false);
    if (pw.a.length < 6) return setErr('Choisissez au moins 6 caractères.');
    if (pw.a !== pw.b) return setErr('Les deux mots de passe ne sont pas identiques.');
    if (await changerMotDePasse(pw.a)) { setPw({ a: '', b: '' }); setOkPw(true); }
  };

  return (
    <>
      <PageHead title="Mon compte" sub="Vos informations de connexion." />
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
        <div className="card stack">
          <h2>Mes informations</h2>
          <Field label="Nom affiché"><input className="input" value={f.nom} onChange={(e) => { setF({ ...f, nom: e.target.value }); setOkInfo(false); }} /></Field>
          <Field label="Téléphone (sert à se connecter)"><input className="input" inputMode="tel" value={f.tel} onChange={(e) => { setF({ ...f, tel: e.target.value }); setOkInfo(false); }} /></Field>
          <div className="row">
            <button className="btn dark" disabled={!f.nom.trim() || f.tel.replace(/\D/g, '').length < 7} onClick={saveInfo}>Enregistrer</button>
            {okInfo && <span className="badge ok">Informations enregistrées</span>}
          </div>
        </div>
        <div className="card stack">
          <h2>Mot de passe</h2>
          <Field label="Nouveau mot de passe"><input className="input" type="password" value={pw.a} onChange={(e) => { setPw({ ...pw, a: e.target.value }); setOkPw(false); }} /></Field>
          <Field label="Confirmer"><input className="input" type="password" value={pw.b} onChange={(e) => { setPw({ ...pw, b: e.target.value }); setOkPw(false); }} /></Field>
          {err && <p className="err">{err}</p>}
          <div className="row">
            <button className="btn primary" disabled={!pw.a} onClick={savePw}>Changer le mot de passe</button>
            {okPw && <span className="badge ok">Mot de passe changé</span>}
          </div>
        </div>
      </div>
    </>
  );
}
