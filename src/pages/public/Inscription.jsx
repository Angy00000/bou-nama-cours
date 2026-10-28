import { useState } from 'react';
import { Link } from 'react-router-dom';
import { inscrire } from '../../data/store.js';
import { Field } from '../../components/ui.jsx';
import { PubHead, PubFoot } from './Home.jsx';

export default function Inscription() {
  const [f, setF] = useState({ nom: '', tel: '', niveau: '', ecole: '', parentTel: '', matieresVoulues: '', lieuVoulu: 'École', adresse: '', password: '', password2: '' });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!f.nom.trim() || !f.tel.trim() || !f.niveau.trim()) return setErr('Le nom, le téléphone et la classe sont obligatoires.');
    if (f.password.length < 4) return setErr('Choisissez un mot de passe d’au moins 4 caractères.');
    if (f.password !== f.password2) return setErr('Les deux mots de passe ne sont pas identiques.');
    const { password2, ...data } = f;
    const r = inscrire(data);
    if (r.error) return setErr(r.error);
    setOk(true);
  };

  return (
    <>
      <PubHead />
      <div className="authbox pad">
        {ok ? (
          <div className="card stack">
            <h1>Demande envoyée</h1>
            <p>Le professeur va valider l’inscription et vous placer dans la bonne classe. Vous pourrez ensuite vous connecter avec votre numéro et votre mot de passe.</p>
            <Link className="btn primary" to="/connexion">Aller à la connexion</Link>
          </div>
        ) : (
          <form className="card stack" onSubmit={submit} noValidate>
            <h1>Inscription</h1>
            <p className="muted">Remplissez ce formulaire. Le professeur valide chaque inscription.</p>
            <Field label="Nom et prénom de l’élève"><input className="input" value={f.nom} onChange={up('nom')} /></Field>
            <div className="form2">
              <Field label="Téléphone de l’élève"><input className="input" inputMode="tel" value={f.tel} onChange={up('tel')} placeholder="77 123 45 67" /></Field>
              <Field label="Téléphone d’un parent"><input className="input" inputMode="tel" value={f.parentTel} onChange={up('parentTel')} /></Field>
            </div>
            <div className="form2">
              <Field label="Classe"><input className="input" value={f.niveau} onChange={up('niveau')} placeholder="Ex. 3e, Terminale S" /></Field>
              <Field label="École fréquentée"><input className="input" value={f.ecole} onChange={up('ecole')} /></Field>
            </div>
            <Field label="Matières souhaitées"><input className="input" value={f.matieresVoulues} onChange={up('matieresVoulues')} placeholder="Ex. Mathématiques" /></Field>
            <Field label="Type de cours">
              <select className="input" value={f.lieuVoulu} onChange={up('lieuVoulu')}>
                <option>École</option><option>Domicile</option><option>En ligne</option>
              </select>
            </Field>
            {f.lieuVoulu === 'Domicile' && (
              <Field label="Quartier / adresse"><input className="input" value={f.adresse} onChange={up('adresse')} /></Field>
            )}
            <div className="form2">
              <Field label="Mot de passe"><input className="input" type="password" value={f.password} onChange={up('password')} /></Field>
              <Field label="Confirmer"><input className="input" type="password" value={f.password2} onChange={up('password2')} /></Field>
            </div>
            {err && <p className="err">{err}</p>}
            <button className="btn primary block">Envoyer la demande</button>
            <p className="small muted">Déjà inscrit ? <Link to="/connexion">Se connecter</Link></p>
          </form>
        )}
      </div>
      <PubFoot />
    </>
  );
}
