import { useEffect, useState } from 'react';
import { getFile } from '../data/store.js';

export const fdate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
export const fdatetime = (iso) =>
  iso ? new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
export const fcfa = (n) => (Number(n) || 0).toLocaleString('fr-FR').replace(/ | /g, ' ') + ' FCFA';
export const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
export const fmois = (m) => {
  const [y, mo] = m.split('-');
  return new Date(+y, +mo - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

export function PageHead({ title, sub, children }) {
  return (
    <div className="pagehead">
      <div className="stack" style={{ gap: 4 }}>
        <h1>{title}</h1>
        {sub && <p className="muted">{sub}</p>}
      </div>
      {children && <div className="row">{children}</div>}
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-label={title}>
        <div className="row between">
          <h2>{title}</h2>
          <button className="btn sm ghost" onClick={onClose}>Fermer</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {hint && <span className="muted small">{hint}</span>}
    </div>
  );
}

export const Empty = ({ children }) => <div className="empty">{children}</div>;

export function ClasseTag({ classe }) {
  if (!classe) return <span className="badge">Toutes les classes</span>;
  return (
    <span className="row" style={{ gap: 6, display: 'inline-flex' }}>
      <span className="dot" style={{ background: classe.couleur }} />
      <span className="small">{classe.nom}</span>
    </span>
  );
}

export function PaiementBadge({ etat }) {
  const m = { paye: ['ok', 'Payé'], partiel: ['warn', 'Partiel'], impaye: ['err', 'Impayé'], na: ['', 'Tarif non défini'] }[etat];
  return <span className={'badge ' + m[0]}>{m[1]}</span>;
}

// Affiche une pièce jointe stockée (ouvre dans un nouvel onglet)
export function FichierLien({ fichierId, fichierNom }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let u;
    getFile(fichierId).then((b) => { if (b) { u = URL.createObjectURL(b); setUrl(u); } });
    return () => u && URL.revokeObjectURL(u);
  }, [fichierId]);
  if (!fichierId) return null;
  return url ? (
    <a className="btn sm ghost" href={url} target="_blank" rel="noreferrer" download={fichierNom}>📎 {fichierNom}</a>
  ) : (
    <span className="badge">📎 {fichierNom}</span>
  );
}

export function Confirm({ label = 'Supprimer', onYes }) {
  const [ask, setAsk] = useState(false);
  if (!ask) return <button className="btn sm danger" onClick={() => setAsk(true)}>{label}</button>;
  return (
    <span className="row" style={{ gap: 6 }}>
      <button className="btn sm danger" onClick={onYes}>Confirmer</button>
      <button className="btn sm ghost" onClick={() => setAsk(false)}>Annuler</button>
    </span>
  );
}
