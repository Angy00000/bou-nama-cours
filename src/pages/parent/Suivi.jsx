import { useState } from 'react';
import { useData, useMe, statutPaiement, changerMotDePasse } from '../../data/store.js';
import { PageHead, Empty, Field, PaiementBadge, ClasseTag, fcfa, fdate, fmois, JOURS } from '../../components/ui.jsx';

const LIB = { present: ['ok', 'Présent'], retard: ['warn', 'Retard'], absent: ['err', 'Absent'] };

export default function Suivi() {
  const s = useData();
  const me = useMe();
  const enfants = s.users.filter((u) => (me.enfantIds || []).includes(u.id));
  const [sel, setSel] = useState(enfants[0]?.id);
  const e = enfants.find((x) => x.id === sel);
  if (!e) return <><PageHead title="Suivi" /><Empty>Aucun enfant rattaché à ce compte. Contactez le professeur.</Empty></>;

  const cls = e.classeIds || [];
  const notes = s.devoirs.filter((d) => cls.includes(d.classeId)).map((d) => ({ d, r: d.rendus.find((r) => r.eleveId === e.id) }));
  const st = statutPaiement(s, e);
  const paiements = s.paiements.filter((p) => p.eleveId === e.id);
  const pres = s.presences.filter((p) => p.eleveId === e.id).sort((a, b) => b.date.localeCompare(a.date));
  const absences = pres.filter((p) => p.statut === 'absent').length;
  const seances = s.seances.filter((x) => cls.includes(x.classeId)).sort((a, b) => ((a.jour + 6) % 7) - ((b.jour + 6) % 7));

  return (
    <>
      <PageHead title={`Suivi de ${e.nom.split(' ')[0]}`} sub={e.niveau ? `${e.niveau}${e.ecole ? ' · ' + e.ecole : ''}` : ''} />
      {enfants.length > 1 && <div className="tabs">{enfants.map((x) => <button key={x.id} className={sel === x.id ? 'on' : ''} onClick={() => setSel(x.id)}>{x.nom}</button>)}</div>}
      <div className="kpis">
        <div className="kpi"><b>{notes.filter((n) => n.r?.note).length}</b><span>devoirs notés</span></div>
        <div className="kpi"><b>{notes.filter((n) => !n.r).length}</b><span>devoirs non rendus</span></div>
        <div className="kpi"><b>{absences}</b><span>absences</span></div>
        <div className="kpi"><PaiementBadge etat={st.etat} /><span style={{ display: 'block', marginTop: 6 }}>paiement de {fmois(new Date().toISOString().slice(0, 7)).split(' ')[0]}</span></div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
        <div className="card stack">
          <h2>Notes et devoirs</h2>
          {notes.length ? <div className="list">{notes.map(({ d, r }) => (
            <div className="item" key={d.id}>
              <div className="grow"><b>{d.titre}</b><div className="small muted">Pour le {fdate(d.dateLimite)}{r?.commentaire ? ` · « ${r.commentaire} »` : ''}</div></div>
              {r?.note ? <span className="badge ok">{r.note}</span> : r ? <span className="badge">Rendu</span> : <span className="badge err">Non rendu</span>}
            </div>
          ))}</div> : <p className="muted">Aucun devoir pour le moment.</p>}
        </div>
        <div className="card stack">
          <h2>Paiements</h2>
          {st.du > 0 && <p className="small">Ce mois : {fcfa(st.paye)} payés sur {fcfa(st.du)}</p>}
          {paiements.length ? <div className="list">{paiements.map((p) => (
            <div className="item" key={p.id}><div className="grow"><b>{fmois(p.mois)}</b><div className="small muted">{p.moyen} · {fdate(p.date)}</div></div><b>{fcfa(p.montant)}</b></div>
          ))}</div> : <p className="muted">Aucun paiement enregistré.</p>}
        </div>
        <div className="card stack">
          <h2>Présences</h2>
          {pres.length ? <div className="list">{pres.slice(0, 12).map((p) => (
            <div className="item" key={p.classeId + p.date}><span>{fdate(p.date)}</span><span className={'badge ' + LIB[p.statut][0]}>{LIB[p.statut][1]}</span></div>
          ))}</div> : <p className="muted">Pas encore d’appel enregistré.</p>}
        </div>
        <div className="card stack">
          <h2>Séances</h2>
          {seances.length ? <div className="list">{seances.map((x) => (
            <div className="item" key={x.id}><div className="grow"><b>{JOURS[x.jour]} {x.heure}</b><div className="small muted">{x.lieu}</div></div><ClasseTag classe={s.classes.find((c) => c.id === x.classeId)} /></div>
          ))}</div> : <p className="muted">Pas de séance planifiée.</p>}
        </div>
      </div>
    </>
  );
}

export function CompteParent() {
  const me = useMe();
  const [pw, setPw] = useState('');
  const [ok, setOk] = useState(false);
  return (
    <>
      <PageHead title="Mon compte" sub={`Connecté avec le ${me.tel}`} />
      <div className="card stack" style={{ maxWidth: 460 }}>
        <Field label="Nouveau mot de passe" hint="Au moins 4 caractères."><input className="input" type="password" value={pw} onChange={(e) => { setPw(e.target.value); setOk(false); }} /></Field>
        <div className="row">
          <button className="btn dark" disabled={pw.length < 4} onClick={async () => { if (await changerMotDePasse(pw)) { setPw(''); setOk(true); } }}>Changer</button>
          {ok && <span className="badge ok">Mot de passe changé</span>}
        </div>
      </div>
    </>
  );
}
