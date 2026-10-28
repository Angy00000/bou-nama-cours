import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData, updateSite } from '../../data/store.js';
import { PageHead, Field } from '../../components/ui.jsx';

export default function Site() {
  const site = useData((s) => s.site);
  const [f, setF] = useState(site);
  const [ok, setOk] = useState(false);
  const up = (k) => (e) => { setOk(false); setF({ ...f, [k]: e.target.value }); };
  const upTarif = (i, k) => (e) => { setOk(false); setF({ ...f, tarifs: f.tarifs.map((t, j) => (j === i ? { ...t, [k]: e.target.value } : t)) }); };
  return (
    <>
      <PageHead title="Mon site" sub="Ce que voient les visiteurs sur la page d’accueil.">
        <Link className="btn ghost" to="/">Voir le site</Link>
      </PageHead>
      <div className="card stack">
        <div className="form2">
          <Field label="Nom de la plateforme"><input className="input" value={f.nom} onChange={up('nom')} /></Field>
          <Field label="Nom affiché du professeur"><input className="input" value={f.prof} onChange={up('prof')} /></Field>
        </div>
        <Field label="Phrase d’accroche"><input className="input" value={f.slogan} onChange={up('slogan')} /></Field>
        <Field label="Présentation"><textarea className="input" value={f.apropos} onChange={up('apropos')} /></Field>
        <div className="form2">
          <Field label="Matières"><input className="input" value={f.matieres} onChange={up('matieres')} /></Field>
          <Field label="Niveaux"><input className="input" value={f.niveaux} onChange={up('niveaux')} /></Field>
        </div>
        <div className="form2">
          <Field label="Téléphone / WhatsApp"><input className="input" value={f.tel} onChange={up('tel')} /></Field>
          <Field label="Zone"><input className="input" value={f.zone} onChange={up('zone')} /></Field>
        </div>
        <Field label="Tarifs">
          <div className="stack" style={{ gap: 8 }}>
            {f.tarifs.map((t, i) => (
              <div className="row" key={i} style={{ flexWrap: 'nowrap' }}>
                <input className="input" value={t.libelle} onChange={upTarif(i, 'libelle')} />
                <input className="input" style={{ maxWidth: 200 }} value={t.prix} onChange={upTarif(i, 'prix')} />
                <button className="btn sm danger" onClick={() => setF({ ...f, tarifs: f.tarifs.filter((_, j) => j !== i) })}>×</button>
              </div>
            ))}
            <button className="btn sm ghost" style={{ justifySelf: 'start' }} onClick={() => setF({ ...f, tarifs: [...f.tarifs, { libelle: '', prix: '' }] })}>Ajouter un tarif</button>
          </div>
        </Field>
        <div className="row">
          <button className="btn primary" onClick={() => { updateSite(f); setOk(true); }}>Enregistrer</button>
          {ok && <span className="badge ok">Site mis à jour</span>}
        </div>
      </div>
    </>
  );
}
