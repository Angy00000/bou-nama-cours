# Bou Nama Cours

Plateforme de cours pour enseignant : site public d'inscription, espace professeur, espace élève.

## Lancer
npm install
npm run dev

## État actuel
Mode démo : les données sont stockées dans le navigateur (src/data/store.js).
Prochaine étape : remplacer les fonctions de store.js par des appels Supabase
(auth par téléphone, tables, stockage des fichiers) pour que prof et élèves partagent les mêmes données.

## Déploiement
Vercel (framework Vite). vercel.json gère les routes.
