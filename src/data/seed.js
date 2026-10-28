// Données d'exemple pour la démo. Tout est modifiable depuis l'espace prof.
const d = (jours) => new Date(Date.now() - jours * 864e5).toISOString();
const mois = new Date().toISOString().slice(0, 7);
const dans = (jours) => new Date(Date.now() + jours * 864e5).toISOString().slice(0, 10);

export function seed() {
  return {
    site: {
      nom: 'Bou Nama Cours',
      slogan: 'Cours de maths et physique, à l’école, à domicile et en ligne',
      prof: 'M. Diop',
      apropos:
        "Professeur de mathématiques et de physique-chimie depuis 12 ans. J'accompagne les élèves du collège au Bac, avec un suivi régulier et des exercices corrigés pour chaque chapitre.",
      matieres: 'Mathématiques, Physique-Chimie',
      niveaux: '4e, 3e (BFEM), Seconde, Première, Terminale (Bac)',
      tel: '77 000 00 00',
      zone: 'Dakar et banlieue',
      tarifs: [
        { libelle: 'Cours en groupe (école)', prix: '15 000 FCFA / mois' },
        { libelle: 'Cours à domicile', prix: '5 000 FCFA / séance' },
        { libelle: 'Prépa examen intensive', prix: '25 000 FCFA / mois' },
      ],
    },
    users: [
      { id: 'u_prof', role: 'prof', statut: 'actif', nom: 'M. Diop (professeur)', tel: '770000000', password: 'prof123', classeIds: [] },
      { id: 'u_awa', role: 'eleve', statut: 'actif', nom: 'Awa Ndiaye', tel: '771112233', password: 'eleve123', niveau: 'Terminale S', ecole: 'Lycée Seydina Limamou Laye', parentTel: '776665544', classeIds: ['c_ts'], tarif: 15000, creeLe: d(40) },
      { id: 'u_moussa', role: 'eleve', statut: 'actif', nom: 'Moussa Fall', tel: '772223344', password: 'eleve123', niveau: 'Terminale S', ecole: 'Lycée Seydina Limamou Laye', parentTel: '775554433', classeIds: ['c_ts'], tarif: 15000, creeLe: d(38) },
      { id: 'u_fatou', role: 'eleve', statut: 'actif', nom: 'Fatou Sarr', tel: '773334455', password: 'eleve123', niveau: '3e', ecole: 'CEM Parcelles', parentTel: '774443322', classeIds: ['c_3e'], tarif: 15000, creeLe: d(30) },
      { id: 'u_ibou', role: 'eleve', statut: 'actif', nom: 'Ibrahima Ba', tel: '774445566', password: 'eleve123', niveau: 'Première S', ecole: '', parentTel: '773332211', classeIds: ['c_dom'], tarif: 20000, adresse: 'Parcelles U17', creeLe: d(20) },
      { id: 'u_khady', role: 'eleve', statut: 'en_attente', nom: 'Khady Gueye', tel: '775556677', password: 'eleve123', niveau: '3e', ecole: 'CEM Parcelles', parentTel: '779998877', matieresVoulues: 'Mathématiques', lieuVoulu: 'École', classeIds: [], creeLe: d(1) },
    ],
    classes: [
      { id: 'c_ts', nom: 'Terminale S – Maths', lieu: 'École', niveau: 'Terminale', matiere: 'Mathématiques', couleur: '#2f6f62' },
      { id: 'c_3e', nom: '3e – Prépa BFEM', lieu: 'École', niveau: '3e', matiere: 'Mathématiques', couleur: '#c0832a' },
      { id: 'c_dom', nom: 'Domicile – Première S', lieu: 'Domicile', niveau: 'Première', matiere: 'Physique-Chimie', couleur: '#6b5fa8' },
    ],
    cours: [
      { id: 'co1', classeId: 'c_ts', chapitre: 'Nombres complexes', titre: 'Cours : forme algébrique et trigonométrique', description: 'Résumé du cours avec 6 exemples corrigés.', type: 'texte', contenu: "1. Forme algébrique : z = a + ib.\n2. Module : |z| = √(a² + b²).\n3. Argument : θ tel que cos θ = a/|z| et sin θ = b/|z|.\n4. Forme trigonométrique : z = |z|(cos θ + i sin θ).\n\nÀ retenir : |z·z'| = |z|·|z'| et arg(z·z') = arg z + arg z' (2π).", date: d(6) },
      { id: 'co2', classeId: 'c_ts', chapitre: 'Nombres complexes', titre: 'Vidéo : passer à la forme exponentielle', description: 'Explication en 12 minutes.', type: 'lien', url: 'https://www.youtube.com/', date: d(4) },
      { id: 'co3', classeId: 'c_ts', chapitre: 'Suites numériques', titre: 'Exercices : suites arithmétiques et géométriques', description: '10 exercices type Bac, corrigé la semaine prochaine.', type: 'texte', contenu: "Exercice 1. (Un) est arithmétique de raison 3 et U0 = 2. Calculer U10 et S = U0 + … + U10.\n\nExercice 2. (Vn) est géométrique de raison 1/2 et V0 = 64. Calculer V6 et la limite de Vn.", date: d(2) },
      { id: 'co4', classeId: 'c_3e', chapitre: 'Théorème de Thalès', titre: 'Fiche de cours Thalès', description: 'L’essentiel pour le BFEM.', type: 'texte', contenu: "Si (MN) // (BC) avec M sur [AB] et N sur [AC], alors AM/AB = AN/AC = MN/BC.\n\nRéciproque : si AM/AB = AN/AC (points dans le même ordre), alors (MN) // (BC).", date: d(3) },
      { id: 'co5', classeId: 'c_dom', chapitre: 'Électricité', titre: 'Loi d’Ohm et puissance', description: 'Cours + 4 exercices.', type: 'texte', contenu: "U = R × I (U en volts, R en ohms, I en ampères).\nP = U × I (P en watts).", date: d(5) },
    ],
    annonces: [
      { id: 'a1', classeId: 'c_ts', texte: 'Contrôle sur les nombres complexes samedi à 10h. Révisez les exercices 1 à 6.', date: d(1) },
      { id: 'a2', classeId: 'tous', texte: 'Pas de cours le jeudi 5 : séance reportée au samedi même heure.', date: d(3) },
      { id: 'a3', classeId: 'c_3e', texte: 'Pensez à apporter votre compas pour la séance de géométrie.', date: d(2) },
    ],
    questions: [
      { id: 'q1', coursId: 'co1', auteurId: 'u_awa', texte: "Pour l'argument, comment savoir si θ est positif ou négatif ?", date: d(5), reponses: [{ auteurId: 'u_prof', texte: 'Regarde le signe de sin θ, donc de b : si b > 0, θ est entre 0 et π.', date: d(5) }] },
      { id: 'q2', coursId: 'co3', auteurId: 'u_moussa', texte: 'Dans l’exercice 2, la limite est bien 0 ?', date: d(1), reponses: [] },
    ],
    messages: [
      { id: 'm1', fromId: 'u_ibou', toId: 'u_prof', texte: "Bonjour monsieur, est-ce qu'on peut décaler la séance de mardi à 18h ?", date: d(1), lu: false },
      { id: 'm2', fromId: 'u_prof', toId: 'u_awa', texte: 'Très bon travail sur le dernier devoir, continue comme ça.', date: d(4), lu: true },
    ],
    devoirs: [
      { id: 'd1', classeId: 'c_ts', titre: 'Devoir 3 – Nombres complexes', consigne: 'Faire les exercices 4, 5 et 6 du cours. Envoyer une photo de la copie.', dateLimite: dans(3), date: d(2), rendus: [
        { eleveId: 'u_awa', texte: 'Voici mes réponses, j’ai un doute sur le 6.', date: d(1), note: '', commentaire: '' },
      ] },
      { id: 'd2', classeId: 'c_3e', titre: 'Exercices Thalès', consigne: 'Exercices 1 à 3 de la fiche.', dateLimite: dans(5), date: d(1), rendus: [] },
    ],
    seances: [
      { id: 's1', classeId: 'c_ts', jour: 2, heure: '17:00', duree: 120, lieu: 'Lycée, salle 12' },
      { id: 's2', classeId: 'c_ts', jour: 6, heure: '10:00', duree: 120, lieu: 'Lycée, salle 12' },
      { id: 's3', classeId: 'c_3e', jour: 3, heure: '15:00', duree: 90, lieu: 'CEM Parcelles' },
      { id: 's4', classeId: 'c_dom', jour: 2, heure: '19:00', duree: 90, lieu: 'Chez Ibrahima, Parcelles U17' },
      { id: 's5', classeId: 'c_dom', jour: 5, heure: '19:00', duree: 90, lieu: 'Chez Ibrahima, Parcelles U17' },
    ],
    paiements: [
      { id: 'p1', eleveId: 'u_awa', montant: 15000, mois, moyen: 'Wave', date: d(3) },
      { id: 'p2', eleveId: 'u_moussa', montant: 10000, mois, moyen: 'Espèces', date: d(2) },
      { id: 'p3', eleveId: 'u_ibou', montant: 20000, mois, moyen: 'Orange Money', date: d(6) },
    ],
  };
}
