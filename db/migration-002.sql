-- Étape 1 IBD RENF : parents, présences, discussions de classe, lien visio (ajouts uniquement)
alter table users drop constraint if exists users_role_check;
alter table users add constraint users_role_check check (role in ('prof','eleve','parent'));
alter table users add column if not exists enfant_ids text[] not null default '{}';
alter table seances add column if not exists lien text;
create table if not exists presences (classe_id text not null references classes(id) on delete cascade, eleve_id text not null, date date not null, statut text not null, primary key (classe_id, eleve_id, date));
create table if not exists discussions (id text primary key, classe_id text not null references classes(id) on delete cascade, auteur_id text not null, texte text not null, date timestamptz not null default now());
create index if not exists discussions_classe_idx on discussions (classe_id, date);
