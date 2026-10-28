import { useState } from 'react';
import { useData, useMe, changerMotDePasse, statutPaiement } from '../../data/store.js';
import { PageHead, Field, PaiementBadge, fcfa, fdate, fmois, ClasseTag } from '../../components/ui.jsx';

export default function Compte() {
  const s = useData();
  const me = useMe();
  const [pw, setPw] = useState('');
  const [ok, setOk] = useState(false);
  const st = statutPaiement(s, me);
  const paiements = s.paiements.filter((p) => p.eleveId === me.id);
  return (
    <>
      <PageHead title="Mon compte" />
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
        <div className="card stack">
          <h2>Mes informations</h2>
          <div className="small stack" style={{ gap: 4 }}>
            <span><b>{me.nom}</b></span>
            <span>Téléphone : {me.tel}</span>
            <span>Parent : {me.parentTel || '—'}</span>
            <span>Classe : {me.niveau}{me.ecole ? ` · ${me.ecole}` : ''}</span>
          </div>
          <div className="stack" style={{ gap: 4 }}>{(me.classeIds || []).map((id) => <ClasseTag key={id} classe={s.classes.find((c) => c.id === id)} />)}</div>
          <Field label="Nouveau mot de passe"><input className="input" type="password" value={pw} onChange={(e) => { setPw(e.target.value); setOk(false); }} /></Field>
          <div className="row">
            <button className="btn dark" disabled={pw.length < 4} onClick={async () => { if (await changerMotDePasse(pw)) { setPw(''); setOk(true); } }}>Changer</button>
            {ok && <span className="badge ok">Mot de passe changé</span>}
          </div>
        </div>
        <div className="card stack">
          <div className="row between"><h2>Paiements</h2><PaiementBadge etat={st.etat} /></div>
          {st.du > 0 && <p className="small">Ce mois : {fcfa(st.paye)} payés sur {fcfa(st.du)}</p>}
          {paiements.length ? <div className="list">{paiements.map((p) => (
            <div className="item" key={p.id}><div className="grow"><b>{fmois(p.mois)}</b><div className="small muted">{p.moyen} · {fdate(p.date)}</div></div><b>{fcfa(p.montant)}</b></div>
          ))}</div> : <p className="muted">Aucun paiement enregistré.</p>}
        </div>
      </div>
    </>
  );
}
