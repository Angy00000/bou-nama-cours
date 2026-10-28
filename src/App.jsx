import { useState } from 'react';
import { BrowserRouter, MemoryRouter, Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useMe, useData, useStatus, logout, clearError } from './data/store.js';
import Home from './pages/public/Home.jsx';
import Inscription from './pages/public/Inscription.jsx';
import Connexion from './pages/public/Connexion.jsx';
import ProfDash from './pages/prof/Dashboard.jsx';
import Inscriptions from './pages/prof/Inscriptions.jsx';
import Eleves from './pages/prof/Eleves.jsx';
import Classes from './pages/prof/Classes.jsx';
import ProfCours from './pages/prof/Cours.jsx';
import ProfDevoirs from './pages/prof/Devoirs.jsx';
import Annonces from './pages/prof/Annonces.jsx';
import Questions from './pages/prof/Questions.jsx';
import Planning from './pages/prof/Planning.jsx';
import Paiements from './pages/prof/Paiements.jsx';
import Site from './pages/prof/Site.jsx';
import CompteProf from './pages/prof/Compte.jsx';
import Messages from './pages/Messages.jsx';
import CoursDetail from './pages/CoursDetail.jsx';
import EleveAccueil from './pages/eleve/Accueil.jsx';
import EleveCours from './pages/eleve/Cours.jsx';
import EleveDevoirs from './pages/eleve/Devoirs.jsx';
import Compte from './pages/eleve/Compte.jsx';

function Toast() {
  const { error } = useStatus();
  if (!error) return null;
  return (
    <div className="toast pad" role="alert">
      <span>{error}</span>
      <button onClick={clearError}>OK</button>
    </div>
  );
}

function Loading() {
  return <div className="empty" style={{ margin: 40 }}>Chargement…</div>;
}

function Shell({ items, children }) {
  const me = useMe();
  const site = useData((s) => s.site);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const close = () => setOpen(false);
  const side = (
    <aside className={'side' + (open ? ' open' : '')}>
      <div className="brand">{site.nom}<small>{me.role === 'prof' ? 'Espace professeur' : 'Espace élève'}</small></div>
      <nav className="nav stack" style={{ gap: 2 }} onClick={close}>
        {items.map((i) => (
          <NavLink key={i.to} to={i.to} end={i.end}>
            <span>{i.label}</span>{i.count ? <span className="count">{i.count}</span> : null}
          </NavLink>
        ))}
      </nav>
      <div className="foot">
        <span>{me.nom}</span>
        <button onClick={() => nav('/')}>Voir le site public</button>
        <button onClick={() => { logout(); nav('/'); }}>Se déconnecter</button>
      </div>
    </aside>
  );
  const current = items.find((i) => (i.end ? loc.pathname === i.to : loc.pathname.startsWith(i.to)));
  return (
    <>
      <Toast />
      <div className="shell">
        {side}
        {open && <div className="scrim" onClick={close} />}
        <div style={{ minWidth: 0 }}>
          <div className="topbar pad">
            <button onClick={() => setOpen(true)} aria-label="Ouvrir le menu">☰ Menu</button>
            <b>{current?.label || site.nom}</b>
            <span style={{ width: 60 }} />
          </div>
          <main className="main pad"><div className="inner">{children}</div></main>
        </div>
      </div>
    </>
  );
}

function ProfArea() {
  const me = useMe();
  const s = useData();
  const { authReady } = useStatus();
  if (!authReady) return <Loading />;
  if (!me) return <Navigate to="/connexion" replace />;
  if (me.role !== 'prof') return <Navigate to="/eleve" replace />;
  const attente = s.users.filter((u) => u.statut === 'en_attente').length;
  const nonLus = s.messages.filter((m) => m.toId === me.id && !m.lu).length;
  const sansRep = s.questions.filter((q) => !q.reponses.length).length;
  const items = [
    { to: '/prof', label: 'Tableau de bord', end: true },
    { to: '/prof/inscriptions', label: 'Inscriptions', count: attente },
    { to: '/prof/eleves', label: 'Élèves' },
    { to: '/prof/classes', label: 'Classes' },
    { to: '/prof/cours', label: 'Cours' },
    { to: '/prof/devoirs', label: 'Devoirs' },
    { to: '/prof/annonces', label: 'Annonces' },
    { to: '/prof/questions', label: 'Questions', count: sansRep },
    { to: '/prof/messages', label: 'Messages', count: nonLus },
    { to: '/prof/planning', label: 'Planning' },
    { to: '/prof/paiements', label: 'Paiements' },
    { to: '/prof/site', label: 'Mon site' },
    { to: '/prof/compte', label: 'Mon compte' },
  ];
  return (
    <Shell items={items}>
      <Routes>
        <Route index element={<ProfDash />} />
        <Route path="inscriptions" element={<Inscriptions />} />
        <Route path="eleves" element={<Eleves />} />
        <Route path="classes" element={<Classes />} />
        <Route path="cours" element={<ProfCours />} />
        <Route path="cours/:id" element={<CoursDetail />} />
        <Route path="devoirs" element={<ProfDevoirs />} />
        <Route path="annonces" element={<Annonces />} />
        <Route path="questions" element={<Questions />} />
        <Route path="messages" element={<Messages />} />
        <Route path="planning" element={<Planning />} />
        <Route path="paiements" element={<Paiements />} />
        <Route path="site" element={<Site />} />
        <Route path="compte" element={<CompteProf />} />
        <Route path="*" element={<Navigate to="/prof" replace />} />
      </Routes>
    </Shell>
  );
}

function EleveArea() {
  const me = useMe();
  const s = useData();
  const { authReady } = useStatus();
  if (!authReady) return <Loading />;
  if (!me) return <Navigate to="/connexion" replace />;
  if (me.role === 'prof') return <Navigate to="/prof" replace />;
  const nonLus = s.messages.filter((m) => m.toId === me.id && !m.lu).length;
  const aRendre = s.devoirs.filter((d) => (me.classeIds || []).includes(d.classeId) && !d.rendus.some((r) => r.eleveId === me.id)).length;
  const items = [
    { to: '/eleve', label: 'Accueil', end: true },
    { to: '/eleve/cours', label: 'Mes cours' },
    { to: '/eleve/devoirs', label: 'Devoirs', count: aRendre },
    { to: '/eleve/messages', label: 'Messages', count: nonLus },
    { to: '/eleve/compte', label: 'Mon compte' },
  ];
  return (
    <Shell items={items}>
      <Routes>
        <Route index element={<EleveAccueil />} />
        <Route path="cours" element={<EleveCours />} />
        <Route path="cours/:id" element={<CoursDetail />} />
        <Route path="devoirs" element={<EleveDevoirs />} />
        <Route path="messages" element={<Messages />} />
        <Route path="compte" element={<Compte />} />
        <Route path="*" element={<Navigate to="/eleve" replace />} />
      </Routes>
    </Shell>
  );
}

// Hébergement classique : vraies URL. Aperçu Claude (VITE_ARTIFACT) : routeur en mémoire.
const Router = import.meta.env.VITE_ARTIFACT ? MemoryRouter : BrowserRouter;

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<><Toast /><Home /></>} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/prof/*" element={<ProfArea />} />
        <Route path="/eleve/*" element={<EleveArea />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
