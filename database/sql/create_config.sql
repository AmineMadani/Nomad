/****************************************************
 * Scripts to Create config objects in the database *
 ****************************************************/

set search_path to config, public;

-- Domain appication type
-- This table defines the core domains application.

create table application_domain
(
    id serial primary key
  , type text unique not null
  , short_fr text
  , short_en text
  , alias_fr text
  , alias_en text
);

/* Comments on table */
COMMENT ON TABLE application_domain IS 'This table lists up all the application domains: drinking water, sewage water...';
/* Comments on fields */
COMMENT ON COLUMN application_domain.id IS 'Table unique ID';
COMMENT ON COLUMN application_domain.type IS 'Type of the domain, used to prefix domain related objects';
COMMENT ON COLUMN application_domain.short_fr IS 'Short french alias of the domain';
COMMENT ON COLUMN application_domain.alias_fr IS 'French alias of the domain';
COMMENT ON COLUMN application_domain.short_en IS 'Short english alias of the domain';
COMMENT ON COLUMN application_domain.alias_en IS 'English alias of the domain';

insert into application_domain
  (id, type , alias_fr                                      , short_fr)
  values
  ( 1, 'dw' , 'Adduction / Distribution Eau Potable'        , 'AEP'   )
, ( 2, 'ww' , 'Collecte / Traitement Assainissement'        , 'ASS'   )
, ( 3, 'sw' , 'Collecte Eaux Pluviales'                     , 'EPL'   )
, (10,'geo' , 'Référentiel géographiques'                   , 'GEO'   )
;

create unique index on application_domain using btree(type);


-- Layer groups
-- This table defines the layer tree.
-- Each layer belongs to a group

create table layer_group
(
    id serial primary key
  , parent_group int references layer_group(id)
  , alias_fr text
  , alias_en text
);

/* Comments on table */
COMMENT ON TABLE layer_group IS 'This table defines all groups and sub-groups to generate the app layer tree';
/* Comments on fields */
COMMENT ON COLUMN layer_group.id IS 'Table unique ID';
COMMENT ON COLUMN layer_group.alias_fr IS 'French alias of the group';
COMMENT ON COLUMN layer_group.alias_en IS 'English alias of the group';

insert into layer_group
  (id, parent_group, alias_fr)
  values
  ( 1,      NULL      , 'Réseau eau potable'),
      ( 11, 1         , 'Ouvrages eau potable'),
      ( 12, 1         , 'Equipement eau potable'),
      ( 13, 1         , 'Branche eau potable'),
  ( 2,      NULL      , 'Réseau assainissement'),
      ( 21, 2         , 'Ouvrages assainissement'),
      ( 22, 2         , 'Equipement assainissement'),
      ( 23, 2         , 'Branche assainissement'),
  ( 3,      NULL      , 'Réseau eau pluviale'),
      ( 31, 3         , 'Ouvrages eau pluviale'),
      ( 32, 3         , 'Equipement eau pluviale'),
      ( 33, 3         , 'Branche eau pluviale')
;


-- Layer
-- This table defines all the layers available in the app.

create table layer
(
    id serial primary key
  , name text not null
  , parent_group int references layer_group(id)
  , application_domain_type text references application_domain(type)
  , pg_table regclass not null
  , geom_column_name text not null
  , geom_srid text not null
  , server_url text
  , alias_fr text
  , alias_en text
);

/* Comments on table */
COMMENT ON TABLE layer IS 'This table defines all the layers available in the app';
/* Comments on fields */
COMMENT ON COLUMN layer.id IS 'Table unique ID';
COMMENT ON COLUMN layer.name IS 'Layer name';
COMMENT ON COLUMN layer.parent_group IS 'Group ID';
COMMENT ON COLUMN layer.application_domain_type IS 'Type of domain';
COMMENT ON COLUMN layer.pg_table IS 'PG table that contains the layer features';
COMMENT ON COLUMN layer.pg_table IS 'Column name that contains features geometry';
COMMENT ON COLUMN layer.pg_table IS 'SRID of the features geometry';
COMMENT ON COLUMN layer.alias_fr IS 'French alias of the layer';
COMMENT ON COLUMN layer.alias_en IS 'English alias of the layer';

insert into layer
(name, parent_group, application_domain_type, pg_table, geom_column_name, geom_srid, server_url, alias_fr)
values
  ('pipe' , 1, 'dw', 'asset_data.aep_canalisation', 'geom', '2154', 'https://next-canope-dev-tiler.hp.hp.m-ve.com/export.nc_aep_canalisation/{z}/{x}/{y}.pbf', 'Canalisation AEP')
, ('facility' , 11, 'dw', 'asset_data.aep_ouvrage', 'geom', '2154', 'https://next-canope-dev-tiler.hp.hp.m-ve.com/export.nc_aep_ouvrage/{z}/{x}/{y}.pbf', 'Ouvrage AEP')
, ('valve' , 12, 'dw', 'asset_data.aep_vanne', 'geom', '2154', 'https://next-canope-dev-tiler.hp.hp.m-ve.com/export.nc_aep_vanne/{z}/{x}/{y}.pbf', 'Vanne AEP')

;
