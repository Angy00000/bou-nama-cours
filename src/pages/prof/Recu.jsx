import { Link, useParams } from 'react-router-dom';
import { useData } from '../../data/store.js';
import { Empty, fcfa, fmois } from '../../components/ui.jsx';
import { waLien } from '../public/Home.jsx';

// Reçu de paiement : à imprimer ou à envoyer au parent par WhatsApp
export default function Recu() {
  const { id } = useParams();
  const s = useData();
  const p = s.paiements.find((x) => x.id === id);
  if (!p) return <Empty>Paiement introuvable.</Empty>;
  const e = s.users.find((u) => u.id === p.eleveId);
  const numero = 'R-' + p.date.slice(0, 10).replace(/-/g, '') + '-' + p.id.slice(-4).toUpperCase();
  const dateTxt = new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const texte = `${s.site.nom} — Reçu ${numero}\nÉlève : ${e?.nom || ''}\nMois : ${fmois(p.mois)}\nMontant : ${fcfa(p.montant)} (${p.moyen})\nDate : ${dateTxt}\nMerci. ${s.site.prof}`;
  const dest = e?.parentTel || e?.tel;

  return (
    <>
      <div className="row no-print">
        <Link to="/prof/paiements" className="small muted">‹ Retour aux paiements</Link>
      </div>
      <div className="card stack recu" style={{ maxWidth: 520 }}>
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <div><h2>{s.site.nom}</h2><p className="small muted">{s.site.prof} · {s.site.tel}</p></div>
          <div style={{ textAlign: 'right' }}><b>REÇU</b><p className="small muted">{numero}</p></div>
        </div>
        <div className="list">
          <div className="item"><span className="muted">Élève</span><b>{e?.nom || 'Ancien élève'}</b></div>
          <div className="item"><span className="muted">Mois</span><b>{fmois(p.mois)}</b></div>
          <div className="item"><span className="muted">Moyen de paiement</span><b>{p.moyen}</b></div>
          <div className="item"><span className="muted">Date</span><b>{dateTxt}</b></div>
          <div className="item"><span className="muted">Montant reçu</span><b style={{ fontSize: 22, fontVariantNumeric: 'tabular-nums' }}>{fcfa(p.montant)}</b></div>
        </div>
        <p className="small muted">Merci pour votre confiance.</p>
      </div>
      <div className="row no-print">
        {dest && <a className="btn primary" href={waLien(dest, texte)} target="_blank" rel="noreferrer">Envoyer par WhatsApp</a>}
        <button className="btn ghost" onClick={() => window.print()}>Imprimer</button>
      </div>
      {!dest && <p className="small muted no-print">Ajoutez le numéro du parent dans la fiche élève pour l’envoyer par WhatsApp.</p>}
    </>
  );
}
