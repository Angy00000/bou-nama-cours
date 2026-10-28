-- Schéma de la base (Neon / Postgres)
create table users (id text primary key, role text not null check (role in ('prof','eleve')), statut text not null default 'en_attente', nom text not null, tel text not null unique, password_hash text not null, niveau text, ecole text, parent_tel text, adresse text, matieres_voulues text, lieu_voulu text, tarif int default 0, classe_ids text[] not null default '{}', cree_le timestamptz not null default now());
create table classes (id text primary key, nom text not null, lieu text, niveau text, matiere text, couleur text);
create table fichiers (id text primary key, nom text not null, type text, taille int, data bytea not null, owner_id text, cree_le timestamptz not null default now());
create table cours (id text primary key, classe_id text not null references classes(id) on delete cascade, chapitre text, titre text not null, description text, type text not null, url text, contenu text, fichier_id text, fichier_nom text, date timestamptz not null default now());
create table annonces (id text primary key, classe_id text not null, texte text not null, date timestamptz not null default now());
create table questions (id text primary key, cours_id text not null references cours(id) on delete cascade, auteur_id text not null, texte text not null, date timestamptz not null default now());
create table reponses (id text primary key, question_id text not null references questions(id) on delete cascade, auteur_id text not null, texte text not null, date timestamptz not null default now());
create table messages (id text primary key, from_id text not null, to_id text not null, texte text not null, date timestamptz not null default now(), lu boolean not null default false);
create table devoirs (id text primary key, classe_id text not null references classes(id) on delete cascade, titre text not null, consigne text, date_limite date not null, fichier_id text, fichier_nom text, date timestamptz not null default now());
create table rendus (devoir_id text not null references devoirs(id) on delete cascade, eleve_id text not null, texte text, fichier_id text, fichier_nom text, note text, commentaire text, date timestamptz not null default now(), primary key (devoir_id, eleve_id));
create table seances (id text primary key, classe_id text not null references classes(id) on delete cascade, jour int not null, heure text not null, duree int, lieu text);
create table paiements (id text primary key, eleve_id text not null, montant int not null, mois text not null, moyen text, date timestamptz not null default now());
create table site (id int primary key default 1 check (id = 1), data jsonb not null);
create index on messages (to_id);
create index on messages (from_id);
create index on cours (classe_id);
create index on paiements (eleve_id, mois);
