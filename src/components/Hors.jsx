import { useEffect, useState } from 'react';

// Bandeau affiché quand le téléphone n'a plus de connexion
export default function Hors() {
  const [off, setOff] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  useEffect(() => {
    const on = () => setOff(false), offH = () => setOff(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', offH);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', offH); };
  }, []);
  if (!off) return null;
  return (
    <div className="demo pad" role="status">
      Hors connexion : vous voyez les cours déjà ouverts. Les envois reprendront au retour du réseau.
    </div>
  );
}
