-- Élèves importés sans numéro : pas d'accès tant que le prof n'a pas ajouté le téléphone
alter table users alter column tel drop not null;
alter table users alter column password_hash drop not null;
