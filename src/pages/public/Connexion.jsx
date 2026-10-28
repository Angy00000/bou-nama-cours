import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { login, loginAs, useMe } from '../../data/store.js';
import { Field } from '../../components/ui.jsx';
import { PubHead, PubFoot } from './Home.jsx';

export default function Connexion() {
  const me = useMe();
  const nav = useNavigate();
  const [tel, setTel] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  if (me) return <Navigate to={me.role === 'prof' ? '/prof' : '/eleve'} replace />;

  const submit = (e) => {
    e.preventDefault();
    const r = login(tel, pw);
    if (r.error) return setErr(r.error);
    nav(r.user.role === 'prof' ? '/prof' : '/eleve');
  };

  return (
    <>
      <PubHead />
      <div className="authbox pad stack">
        <form className="card stack" onSubmit={submit}>
          <h1>Connexion</h1>
          <Field label="Numéro de téléphone"><input className="input" inputMode="tel" value={tel} onChange={(e) => setTel(e.target.value)} /></Field>
          <Field label="Mot de passe"><input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
          {err && <p className="err">{err}</p>}
          <button className="btn primary block">Se connecter</button>
          <p className="small muted">Pas encore inscrit ? <Link to="/inscription">Faire une demande</Link></p>
        </form>
        <div className="card flat stack">
          <h3>Essayer la démo</h3>
          <p className="small muted">Prof : 77 000 00 00 / prof123 · Élève : 77 111 22 33 / eleve123</p>
          <div className="row">
            <button className="btn dark sm" onClick={() => { loginAs('u_prof'); nav('/prof'); }}>Entrer comme professeur</button>
            <button className="btn ghost sm" onClick={() => { loginAs('u_awa'); nav('/eleve'); }}>Entrer comme élève (Awa)</button>
          </div>
        </div>
      </div>
      <PubFoot />
    </>
  );
}
