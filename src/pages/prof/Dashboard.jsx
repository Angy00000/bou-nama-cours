import { Link } from 'react-router-dom';
import { useData, useMe, statutPaiement, moisCourant } from '../../data/store.js';
import { PageHead, ClasseTag, fcfa, fdate, JOURS, fmois } from '../../components/ui.jsx';

export default function Dashboard() {
  const s = useData();
  const me = useMe();
  const eleves = s.users.filter((u) => u.role === 'eleve' && u.statut === 'actif');
  const attente = s.users.filter((u) => u.statut === 'en_attente');
  const mois = moisCourant();
  const encaisse = s.paiements.filter((p) => p.mois === mois).reduce((a, p) => a + Number(p.montant), 0);
  const impayes = eleves.filter((e) => ['impaye', 'partiel'].includes(statutPaiement(s, e).etat));
  const jour = new Date().getDay();
  const today = s.seances.filter((x) => x.jour === jour).sort((a, b) => a.heure.localeCompare(b.heure));
  const sansRep = s.questions.filter((q) => !q.reponses.length);
  const nonLus = s.messages.filter((m) => m.toId === me.id && !m.lu);
  const aCorriger = s.devoirs.flatMap((d) => d.rendus.filter((r) => !r.note).map((r) => ({ d, r })));
  const cl = (id) => s.classes.find((c) => c.id === id);
  const nom = (id) => s.users.find((u) => u.id === id)?.nom || 'Élève';

  return (
    <>
      <PageHead title={`Bonjour ${me.nom.split(' (')[0]}`} sub={`${JOURS[jour]} ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`} />
      <div className="kpis">
        <div className="kpi"><b>{eleves.length}</b><span>élèves actifs</span></div>
        <div className="kpi"><b>{s.classes.length}</b><span>classes</span></div>
        <div className="kpi"><b>{fcfa(encaisse).replace(' FCFA', '')}</b><span>FCFA encaissés en {fmois(mois).split(' ')[0]}</span></div>
        <div className="kpi"><b>{impayes.length}</b><span>élèves à relancer</span></div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
        <div className="card stack">
          <div className="row between"><h2>À faire</h2></div>
          <div className="list">
            {attente.length > 0 && <Todo to="/prof/inscriptions" n={attente.length} t="inscription(s) à valider" />}
            {sansRep.length > 0 && <Todo to="/prof/questions" n={sansRep.length} t="question(s) sans réponse" />}
            {nonLus.length > 0 && <Todo to="/prof/messages" n={nonLus.length} t="message(s) non lu(s)" />}
            {aCorriger.length > 0 && <Todo to="/prof/devoirs" n={aCorriger.length} t="devoir(s) à corriger" />}
            {impayes.length > 0 && <Todo to="/prof/paiements" n={impayes.length} t="paiement(s) en retard ce mois" />}
            {!attente.length && !sansRep.length && !nonLus.length && !aCorriger.length && !impayes.length && <p className="muted item">Rien en attente.</p>}
          </div>
        </div>

        <div className="card stack">
          <div className="row between"><h2>Séances du jour</h2><Link className="small" to="/prof/planning">Planning</Link></div>
          {today.length ? (
            <div className="list">
              {today.map((x) => (
                <div className="item" key={x.id}>
                  <div className="grow stack" style={{ gap: 2 }}><ClasseTag classe={cl(x.classeId)} /><span className="small muted">{x.lieu}</span></div>
                  <b style={{ fontVariantNumeric: 'tabular-nums' }}>{x.heure}</b>
                </div>
              ))}
            </div>
          ) : <p className="muted">Aucune séance aujourd’hui.</p>}
        </div>
      </div>

      <div className="card stack">
        <div className="row between"><h2>Derniers devoirs rendus</h2><Link className="small" to="/prof/devoirs">Tous les devoirs</Link></div>
        {aCorriger.length ? (
          <div className="list">
            {aCorriger.slice(0, 5).map(({ d, r }) => (
              <div className="item" key={d.id + r.eleveId}>
                <div className="grow"><b>{nom(r.eleveId)}</b><div className="small muted">{d.titre}</div></div>
                <span className="small muted">{fdate(r.date)}</span>
              </div>
            ))}
          </div>
        ) : <p className="muted">Aucun devoir en attente de correction.</p>}
      </div>
    </>
  );
}

function Todo({ to, n, t }) {
  return (
    <Link to={to} className="item" style={{ textDecoration: 'none' }}>
      <span><b style={{ color: 'var(--accent)' }}>{n}</b> {t}</span><span className="muted">›</span>
    </Link>
  );
}
