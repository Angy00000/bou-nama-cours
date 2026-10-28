import { useState } from 'react';
import { useData, ajouterCours, saveFile } from '../../data/store.js';
import { PageHead, Empty, Modal, Field } from '../../components/ui.jsx';
import CoursList from '../../components/CoursList.jsx';

export default function Cours() {
  const s = useData();
  const [classe, setClasse] = useState(s.classes[0]?.id || '');
  const [add, setAdd] = useState(false);
  const cours = s.cours.filter((c) => c.classeId === classe);
  return (
    <>
      <PageHead title="Cours" sub="Publiez cours, fiches, exercices et vidéos pour chaque classe.">
        <button className="btn primary" disabled={!s.classes.length} onClick={() => setAdd(true)}>Publier un cours</button>
      </PageHead>
      <div className="tabs">
        {s.classes.map((c) => <button key={c.id} className={classe === c.id ? 'on' : ''} onClick={() => setClasse(c.id)}>{c.nom}</button>)}
      </div>
      {!s.classes.length ? <Empty>Créez d’abord une classe.</Empty>
        : cours.length ? <CoursList cours={cours} base="/prof/cours" questions={s.questions} />
        : <Empty>Aucun cours publié pour cette classe.</Empty>}
      {add && <CoursForm classes={s.classes} defaut={classe} chapitres={[...new Set(s.cours.map((c) => c.chapitre).filter(Boolean))]} onClose={() => setAdd(false)} />}
    </>
  );
}

function CoursForm({ classes, defaut, chapitres, onClose }) {
  const [f, setF] = useState({ classeId: defaut, chapitre: '', titre: '', description: '', type: 'fichier', url: '', contenu: '' });
  const [file, setFile] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async () => {
    if (!f.titre.trim()) return setErr('Donnez un titre au cours.');
    if (f.type === 'fichier' && !file) return setErr('Choisissez un fichier.');
    if (f.type === 'lien' && !/^https?:\/\//.test(f.url)) return setErr('Le lien doit commencer par https://');
    if (file && file.size > 4 * 1024 * 1024) return setErr('Fichier trop lourd (4 Mo maximum). Pour une vidéo, utilisez plutôt un lien YouTube.');
    setBusy(true);
    try {
      const extra = f.type === 'fichier' ? await saveFile(file) : {};
      if (await ajouterCours({ ...f, ...extra })) return onClose();
    } catch (e) {
      setErr(e.message || 'Le fichier n’a pas pu être enregistré.');
    }
    setBusy(false);
  };

  return (
    <Modal title="Publier un cours" onClose={onClose}>
      <div className="stack">
        <div className="form2">
          <Field label="Classe">
            <select className="input" value={f.classeId} onChange={up('classeId')}>{classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}</select>
          </Field>
          <Field label="Chapitre">
            <input className="input" list="chapitres" value={f.chapitre} onChange={up('chapitre')} placeholder="Ex. Suites numériques" />
            <datalist id="chapitres">{chapitres.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
        </div>
        <Field label="Titre"><input className="input" value={f.titre} onChange={up('titre')} placeholder="Ex. Exercices corrigés" /></Field>
        <Field label="Description (facultatif)"><input className="input" value={f.description} onChange={up('description')} /></Field>
        <Field label="Type">
          <div className="tabs">
            {[['fichier', 'Fichier (PDF, photo…)'], ['lien', 'Lien / vidéo'], ['texte', 'Texte']].map(([k, l]) => (
              <button key={k} type="button" className={f.type === k ? 'on' : ''} onClick={() => setF({ ...f, type: k })}>{l}</button>
            ))}
          </div>
        </Field>
        {f.type === 'fichier' && <Field label="Fichier" hint="PDF, Word, image, audio. 4 Mo maximum."><input className="input" type="file" onChange={(e) => setFile(e.target.files[0] || null)} /></Field>}
        {f.type === 'lien' && <Field label="Adresse du lien" hint="YouTube (non répertorié), Google Drive…"><input className="input" value={f.url} onChange={up('url')} placeholder="https://" /></Field>}
        {f.type === 'texte' && <Field label="Contenu"><textarea className="input" style={{ minHeight: 180 }} value={f.contenu} onChange={up('contenu')} /></Field>}
        {err && <p className="err">{err}</p>}
        <button className="btn primary" disabled={busy} onClick={save}>{busy ? 'Publication…' : 'Publier pour la classe'}</button>
      </div>
    </Modal>
  );
}
