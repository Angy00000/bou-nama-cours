import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { login, useMe } from '../../data/store.js';
import { Field } from '../../components/ui.jsx';
import { PubHead, PubFoot } from './Home.jsx';

export default function Connexion() {
  const me = useMe();
  const nav = useNavigate();
  const [tel, setTel] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (me) return <Navigate to={me.role === 'prof' ? '/prof' : '/eleve'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const r = await login(tel, pw);
    setBusy(false);
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
          <button className="btn primary block" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</button>
          <p className="small muted">Pas encore inscrit ? <Link to="/inscription">Faire une demande</Link></p>
        </form>
      </div>
      <PubFoot />
    </>
  );
}
