import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData, ajouterPaiement, supprimerPaiement, statutPaiement, moisCourant } from '../../data/store.js';
import { PageHead, Modal, Field, PaiementBadge, fcfa, fdate, fmois, Confirm } from '../../components/ui.jsx';

function moisListe() {
  const out = [];
  const d = new Date();
  for (let i = -6; i <= 1; i++) {
    const x = new Date(d.getFullYear(), d.getMonth() + i, 1);
    out.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`);
  }
  return out.reverse();
}

export default function Paiements() {
  const s = useData();
  const [mois, setMois] = useState(moisCourant());
  const [add, setAdd] = useState(null);
  const eleves = s.users.filter((u) => u.role === 'eleve' && u.statut === 'actif').sort((a, b) => a.nom.localeCompare(b.nom));
  const lignes = eleves.map((e) => ({ e, st: statutPaiement(s, e, mois) }));
  const encaisse = lignes.reduce((a, l) => a + l.st.paye, 0);
  const attendu = lignes.reduce((a, l) => a + l.st.du, 0);
  const histo = s.paiements.filter((p) => p.mois === mois);
  const nom = (id) => s.users.find((u) => u.id === id)?.nom || 'Ancien élève';

  return (
    <>
      <PageHead title="Paiements" sub="Suivi mensuel par élève.">
        <select className="input" style={{ width: 'auto' }} value={mois} onChange={(e) => setMois(e.target.value)}>
          {moisListe().map((m) => <option key={m} value={m}>{fmois(m)}</option>)}
        </select>
        <button className="btn primary" onClick={() => setAdd({})}>Enregistrer un paiement</button>
      </PageHead>
      <div className="kpis">
        <div className="kpi"><b>{fcfa(encaisse)}</b><span>encaissé</span></div>
        <div className="kpi"><b>{fcfa(Math.max(attendu - encaisse, 0))}</b><span>reste à percevoir</span></div>
        <div className="kpi"><b>{lignes.filter((l) => l.st.etat === 'impaye').length}</b><span>élèves sans paiement</span></div>
      </div>
      <div className="card tablewrap">
        <table>
          <thead><tr><th>Élève</th><th className="num">Tarif</th><th className="num">Payé</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {lignes.map(({ e, st }) => (
              <tr key={e.id}>
                <td><b>{e.nom}</b><div className="small muted">Parent : {e.parentTel || '—'}</div></td>
                <td className="num">{st.du ? fcfa(st.du) : '—'}</td>
                <td className="num">{fcfa(st.paye)}</td>
                <td><PaiementBadge etat={st.etat} /></td>
                <td>{st.etat !== 'paye' && <button className="btn sm ghost" onClick={() => setAdd({ eleveId: e.id, montant: Math.max(st.du - st.paye, 0) })}>Encaisser</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card stack">
        <h2>Historique de {fmois(mois)}</h2>
        {histo.length ? (
          <div className="list">
            {histo.map((p) => (
              <div className="item" key={p.id}>
                <div className="grow"><b>{nom(p.eleveId)}</b><div className="small muted">{p.moyen} · {fdate(p.date)}</div></div>
                <b style={{ fontVariantNumeric: 'tabular-nums' }}>{fcfa(p.montant)}</b>
                <Link className="btn sm ghost" to={`/prof/recu/${p.id}`}>Reçu</Link>
                <Confirm label="×" onYes={() => supprimerPaiement(p.id)} />
              </div>
            ))}
          </div>
        ) : <p className="muted">Aucun paiement enregistré ce mois.</p>}
      </div>
      {add && <PaiementForm init={{ mois, ...add }} eleves={eleves} onClose={() => setAdd(null)} />}
    </>
  );
}

function PaiementForm({ init, eleves, onClose }) {
  const [f, setF] = useState({ eleveId: eleves[0]?.id, montant: '', moyen: 'Wave', ...init });
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title="Enregistrer un paiement" onClose={onClose}>
      <div className="stack">
        <Field label="Élève"><select className="input" value={f.eleveId} onChange={up('eleveId')}>{eleves.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}</select></Field>
        <div className="form2">
          <Field label="Montant (FCFA)"><input className="input" inputMode="numeric" value={f.montant} onChange={up('montant')} /></Field>
          <Field label="Moyen"><select className="input" value={f.moyen} onChange={up('moyen')}><option>Wave</option><option>Orange Money</option><option>Espèces</option><option>Virement</option></select></Field>
        </div>
        <Field label="Mois concerné"><select className="input" value={f.mois} onChange={up('mois')}>{moisListe().map((m) => <option key={m} value={m}>{fmois(m)}</option>)}</select></Field>
        <button className="btn primary" disabled={!Number(f.montant)} onClick={async () => { if (await ajouterPaiement({ ...f, montant: Number(f.montant) })) onClose(); }}>Enregistrer</button>
      </div>
    </Modal>
  );
}
