import { useEffect, useState } from 'react';
import { useData, enregistrerPresences, elevesDeClasse } from '../../data/store.js';
import { PageHead, Empty, fdate } from '../../components/ui.jsx';

const STATUTS = [['present', 'Présent', 'ok'], ['retard', 'Retard', 'warn'], ['absent', 'Absent', 'err']];
const aujourdhui = () => new Date().toISOString().slice(0, 10);

export default function Presences() {
  const s = useData();
  const [classe, setClasse] = useState(s.classes[0]?.id || '');
  const [date, setDate] = useState(aujourdhui());
  const eleves = elevesDeClasse(s, classe).sort((a, b) => a.nom.localeCompare(b.nom));
  const dejaFait = s.presences.filter((p) => p.classeId === classe && p.date === date);
  const [lignes, setLignes] = useState({});
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  // Recharge l'appel déjà enregistré pour cette classe et cette date
  useEffect(() => {
    const m = {};
    for (const e of eleves) m[e.id] = dejaFait.find((p) => p.eleveId === e.id)?.statut || 'present';
    setLignes(m); setOk(false);
  }, [classe, date, s.presences.length]);

  const save = async () => {
    setBusy(true);
    if (await enregistrerPresences(classe, date, Object.entries(lignes).map(([eleveId, statut]) => ({ eleveId, statut })))) setOk(true);
    setBusy(false);
  };

  // Historique des absences sur 30 jours
  const depuis = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const absences = eleves.map((e) => ({
    e, n: s.presences.filter((p) => p.eleveId === e.id && p.classeId === classe && p.date >= depuis && p.statut === 'absent').length,
  })).filter((x) => x.n);

  return (
    <>
      <PageHead title="Présences" sub="Faites l’appel en début de séance." />
      {!s.classes.length ? <Empty>Créez d’abord une classe.</Empty> : (
        <>
          <div className="row">
            <div className="tabs">{s.classes.map((c) => <button key={c.id} className={classe === c.id ? 'on' : ''} onClick={() => setClasse(c.id)}>{c.nom}</button>)}</div>
            <input className="input" type="date" style={{ width: 'auto' }} value={date} max={aujourdhui()} onChange={(e) => setDate(e.target.value)} />
          </div>
          {eleves.length ? (
            <div className="card stack">
              <div className="row between">
                <h2>Appel du {fdate(date)}</h2>
                {dejaFait.length > 0 && <span className="badge ok">Déjà enregistré</span>}
              </div>
              <div className="list">
                {eleves.map((e) => (
                  <div className="item" key={e.id} style={{ alignItems: 'center' }}>
                    <b className="grow">{e.nom}</b>
                    <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
                      {STATUTS.map(([k, l, c]) => (
                        <button key={k} type="button" className={'badge ' + (lignes[e.id] === k ? c : '')}
                          style={{ border: '1px solid var(--line)', cursor: 'pointer', padding: '6px 10px', fontSize: 13, opacity: lignes[e.id] === k ? 1 : .6 }}
                          onClick={() => { setLignes({ ...lignes, [e.id]: k }); setOk(false); }}>{l}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="row">
                <button className="btn primary" disabled={busy} onClick={save}>{busy ? 'Enregistrement…' : 'Enregistrer l’appel'}</button>
                {ok && <span className="badge ok">Appel enregistré</span>}
              </div>
            </div>
          ) : <Empty>Aucun élève dans cette classe.</Empty>}
          <div className="card stack">
            <h2>Absences des 30 derniers jours</h2>
            {absences.length ? <div className="list">{absences.map(({ e, n }) => (
              <div className="item" key={e.id}><b>{e.nom}</b><span className="badge err">{n} absence{n > 1 ? 's' : ''}</span></div>
            ))}</div> : <p className="muted">Aucune absence.</p>}
          </div>
        </>
      )}
    </>
  );
}
