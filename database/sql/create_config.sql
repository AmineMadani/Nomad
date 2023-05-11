/****************************************************
 * Scripts to Create config objects in the database *
 ****************************************************/

set search_path to nomad, public;

create table float_setting (
    name text primary key
  , value double precision
);

create table text_setting (
    name text primary key
  , value text
);



--
-- Domain appication type
-- This table defines the core domains application.
-- Layers and business objects are referenced to a domain
-- A domain can have child domains, for example, the asset
-- Domain can be divided in 2 sub domains : drinking water, ans waste water

create table domain
(
    id serial primary key
  , type text unique not null
  , parent_type text  references domain(type)
  , short text
  , alias text
);

/* Comments on table */
COMMENT ON TABLE domain IS 'This table lists up all the application domains: drinking water, sewage water...';
/* Comments on fields */
COMMENT ON COLUMN domain.id IS 'Table unique ID';
COMMENT ON COLUMN domain.type IS 'Type of the domain, used to prefix domain related objects';
COMMENT ON COLUMN domain.alias IS 'Alias of the domain';
COMMENT ON COLUMN domain.short IS 'Short alias of the domain';

--
-- User appication
-- This table defines the application users.

create table "user"
(
  id                serial primary key,
  usr_first_name    text not null,
  usr_last_name	    text not null,
  usr_email	        text unique not null,
  --usr_valid         boolean default 'O',  --FIXME Besoin de définition
  usr_ucre_id       integer references nomad.user(id),
  usr_umod_id       bigint default 0,
  --- FIXME Plus facile d'harmoniser les métadonnées
  usr_dcre          timestamp without time zone  default current_timestamp,
  usr_dmod          timestamp without time zone  default current_timestamp
);

/* Comments on table */
COMMENT ON TABLE "user" IS 'This table defines the application users.';
/* Comments on fields */
COMMENT ON COLUMN "user".id IS 'Table unique ID';
COMMENT ON COLUMN "user".usr_first_name IS 'User first name';
COMMENT ON COLUMN "user".usr_last_name IS 'User last name';
--
COMMENT ON COLUMN "user".usr_ucre_id IS 'User last name';


-- Layer tree
-- This table defines the layer tree exposed in the application.
-- Each layer belongs to a group

create table tree
(
    id serial primary key
  , domain_type text references domain(type)
  , parent_id integer references tree(id)
  , num_order integer
  , alias text
  , short text
);

/* Comments on table */
COMMENT ON TABLE tree IS 'This table defines all groups and sub-groups to generate the app layer tree';
/* Comments on fields */
COMMENT ON COLUMN tree.id IS 'Table unique ID';
COMMENT ON COLUMN tree.domain_type IS 'Application domain (ie: drinking water, ...)';
COMMENT ON COLUMN tree.parent_id IS 'Parent id';
COMMENT ON COLUMN tree.alias IS 'Alias of the tree group';


-- Value Lists
-- List of topological famility
-- gives topological behabiour for business object

create table vl_topology_type
(
    id serial primary key
  , type text unique not null
  , required_fields text[]
);

insert into vl_topology_type(type, required_fields)
  values
  ('arc' , null)--'{start_node,end_node}')
, ('node' , null)
, ('point', null)
, ('lateral_line', null)--'{arc_id}')
, ('lateral_node', null)
, ('lateral_point', null);

-- Layer
-- This table defines all the layers available in the app.

create table asset_type
(
    id serial primary key
  , domain_type text references domain(type)
  , code text unique not null -- code hérité de CANOPE / PICRU (20, 21...)
  , alias text
);


/* Comments on table */
COMMENT ON TABLE asset_type IS 'This table defines all the different types of asset';
/* Comments on fields */
COMMENT ON COLUMN asset_type.id IS 'Table unique ID';
COMMENT ON COLUMN asset_type.domain_type IS 'Domain type';
COMMENT ON COLUMN asset_type.code IS 'Code asset';
COMMENT ON COLUMN asset_type.alias IS 'Alias asset type';


-- Layer
-- This table defines all the layers available in the app.

create table layer
(
    id serial primary key
  , num_order integer
  , domain_type text references domain(type)
  , asset_type text references asset_type(code) -- code hérité de CANOPE / PICRU (20, 21...)
  , tree_group_id integer references tree(id)
  , simplified_tree_group_id  integer references tree(id)
  , lyr_table_name text unique not null
  , lyr_schema_name text not null
  , geom_column_name text not null
  , uuid_column_name text not null
  , geom_srid text not null
  , style text
  , alias text
  , display boolean default true
);

/* Comments on table */
COMMENT ON TABLE layer IS 'This table defines all the layers available in the app';
/* Comments on fields */
COMMENT ON COLUMN layer.id IS 'Table unique ID';
COMMENT ON COLUMN layer.tree_group_id IS 'Tree group';
COMMENT ON COLUMN layer.simplified_tree_group_id IS 'Simplified grpoup ID';
COMMENT ON COLUMN layer.lyr_table_name IS 'Table that contains the layer features';
COMMENT ON COLUMN layer.lyr_schema_name IS 'Schema where the table is stored';
COMMENT ON COLUMN layer.geom_column_name IS 'Column name that contains features geometry';
COMMENT ON COLUMN layer.uuid_column_name IS 'Column name that contains unique ID';
COMMENT ON COLUMN layer.geom_srid IS 'SRID of the features geometry';
COMMENT ON COLUMN layer.style IS 'Mapbox json style';
COMMENT ON COLUMN layer.alias IS 'French alias of the layer';

-- Basemaps
-- This table defines all the basemaps available in the app.

create table basemaps
(
  id serial primary key
  , alias text
  , type  text
  , url text
  , layer text
  , matrixset text
  , format text
  , projection text
  , tilegrid text
  , style text
  , attributions text
  , "default" boolean default false
  , display boolean default false
  , thumbnail bytea
);

/* Comments on table */
COMMENT ON TABLE basemaps IS 'This table defines all the raster layers available in the app';
/* Comments on fields */
COMMENT ON COLUMN basemaps.id IS 'Table unique ID';
COMMENT ON COLUMN basemaps.type IS 'Basemap  ty:pe (WMTS, WMS...)';
COMMENT ON COLUMN basemaps.display IS 'Display basemap';
COMMENT ON COLUMN basemaps.default IS 'Default basemap';
COMMENT ON COLUMN basemaps.url IS 'Basemap URL';
COMMENT ON COLUMN basemaps.layer IS 'Layer to display';
COMMENT ON COLUMN basemaps.matrixset IS 'Matrix set';
COMMENT ON COLUMN basemaps.format IS 'Format (png...)';
COMMENT ON COLUMN basemaps.projection IS 'Projection system (EPSG: 3857)';
COMMENT ON COLUMN basemaps.tilegrid IS 'Tile grid';
COMMENT ON COLUMN basemaps.style IS 'Style';
COMMENT ON COLUMN basemaps.attributions IS 'WS attributions';
COMMENT ON COLUMN basemaps.thumbnail IS 'Image thumbnail';



-- Create table to store a grid that covers all asset
-- Used to export GeoJson
drop table if exists app_grid;
create table app_grid
(
id serial primary key
, geom geometry('Polygon', 3857)
, created_date timestamp default current_date
, last_edited_date timestamp default current_date
);

/* Comments on table */
COMMENT ON TABLE app_grid IS 'This table defines the grid to export geojson';
/* Comments on fields */
COMMENT ON COLUMN app_grid.geom IS 'Geometry of the grid';
COMMENT ON COLUMN app_grid.created_date IS 'Created date';
COMMENT ON COLUMN app_grid.last_edited_date IS 'Last edited date';


-- Create table layer_references to store the corresponding columns for each layers
CREATE TABLE layer_references(
    id SERIAL PRIMARY KEY,
    lyr_table_name text NOT NULL REFERENCES layer(lyr_table_name),
    reference_key text NOT NULL,
    alias text,
    created_date timestamp default current_date,
    last_edited_date timestamp default current_date
);
/* Comments on table */
COMMENT ON TABLE layer_references IS 'This table defines the corresponding columns (reference_key) for each layers';
/* Comments on fields */
COMMENT ON COLUMN layer_references.id IS 'Table unique ID';
COMMENT ON COLUMN layer_references.lyr_table_name IS 'Postgres Table';
COMMENT ON COLUMN layer_references.reference_key IS 'Reference key. It is the column name in the layer table';
COMMENT ON COLUMN layer_references.alias IS 'Alias to display in the app';
COMMENT ON COLUMN layer_references.created_date IS 'Created date';
COMMENT ON COLUMN layer_references.last_edited_date IS 'Last edited date';

CREATE TYPE layer_references_display_type AS ENUM ('SYNTHETIC','DETAILED');

-- Create table layer_references_default to store the default display_type and position for each layer_references
CREATE TABLE layer_references_default(
    id SERIAL PRIMARY KEY,
    layer_reference_id INT NOT NULL REFERENCES layer_references (id),
    position INT NOT NULL,
    section text,
    isvisible boolean default true,
    display_type layer_references_display_type NOT NULL,
    created_date timestamp default current_date,
    last_edited_date timestamp default current_date
);
/* Comments on table */
COMMENT ON TABLE layer_references_default IS 'This table defines the default display_type and position for each layer_references in the app';
/* Comments on fields */
COMMENT ON COLUMN layer_references_default.id IS 'Table unique ID';
COMMENT ON COLUMN layer_references_default.layer_reference_id IS 'Layer reference ID';
COMMENT ON COLUMN layer_references_default.position IS 'Position in the app';
COMMENT ON COLUMN layer_references_default.display_type IS 'Display type (SYNTHETIC or DETAILED)';
COMMENT ON COLUMN layer_references_default.section IS 'Section to group properties';
COMMENT ON COLUMN layer_references_default.isvisible IS 'If visible, true else false';
COMMENT ON COLUMN layer_references_default.created_date IS 'Created date';
COMMENT ON COLUMN layer_references_default.last_edited_date IS 'Last edited date';

-- Create table layer_references_user to store the user display_type and position for each layer_references
CREATE TABLE layer_references_user(
    id SERIAL PRIMARY KEY NOT NULL,
    layer_reference_id INT NOT NULL REFERENCES layer_references (id),
    user_id INT NOT NULL REFERENCES nomad.user(id),
    position INT NOT NULL,
    display_type layer_references_display_type NOT NULL,
    section text,
    isvisible boolean default true,
    created_date timestamp default current_date,
    last_edited_date timestamp default current_date
);
/* Comments on table */
COMMENT ON TABLE layer_references_user IS 'This table defines the user display_type and position for each layer_references in the app';
/* Comments on fields */
COMMENT ON COLUMN layer_references_user.id IS 'Table unique ID';
COMMENT ON COLUMN layer_references_user.layer_reference_id IS 'Layer reference ID';
COMMENT ON COLUMN layer_references_user.user_id IS 'User ID';
COMMENT ON COLUMN layer_references_user.position IS 'Position in the app';
COMMENT ON COLUMN layer_references_user.display_type IS 'Display type (SYNTHETIC or DETAILED)';
COMMENT ON COLUMN layer_references_user.isvisible IS 'If visible, true else false';
COMMENT ON COLUMN layer_references_user.section IS 'Section to group properties';
COMMENT ON COLUMN layer_references_user.created_date IS 'Created date';
COMMENT ON COLUMN layer_references_user.last_edited_date IS 'Last edited date';

create table if not exists contract_activity(
  id                           serial primary key,
  act_code                     text unique not null,
  act_slabel	        	       text,
  act_llabel	        	       text,
  act_valid                    boolean default true,
  ucre_id                      integer references nomad.user(id),
  umod_id                      integer references nomad.user(id),
  act_dcre                     timestamp without time zone  default current_timestamp,
  act_dmod                     timestamp without time zone  default current_timestamp
);

--FIXME manque la notion d'exploitant / de DICT / DSP ou Hors DSP / statut . Type client
--FIXME manque la notion de territoire
create table if not exists contract(
  id                           serial primary key,
  ctr_code                     text unique,
  ctr_slabel	        	       text,
  ctr_llabel	        	       text,
  ctr_valid                    boolean default True,
  ctr_start_date               timestamp without time zone,
  ctr_end_date                 timestamp without time zone,
  usr_cre_id                   integer references nomad.user(id),
  usr_mod_id                   integer references nomad.user(id),
  ctr_dcre                     timestamp without time zone  default current_timestamp,
  ctr_dmod                     timestamp without time zone  default current_timestamp,
  act_code                     text references contract_activity(act_code),
  geom                         geometry('MULTIPOLYGON', :srid)
);

create index on contract using gist(geom);

--FIXME manque la notion de territoire
create table if not exists city(
  id                           serial primary key,
  city_code                    text unique,
  city_label	        	       text,
  usr_cre_id                   integer references nomad.user(id),
  usr_mod_id                   integer references nomad.user(id),
  city_dcre                    timestamp without time zone  default current_timestamp,
  city_dmod                    timestamp without time zone  default current_timestamp,
  geom                         geometry('MULTIPOLYGON', :srid)
);

create index on city using gist(geom);

create table if not exists workorder_task_status
(
  id                           serial primary key,
  wts_code                     text unique not null,
  wts_slabel	        	       text not null,
  wts_llabel	        	       text,
  wts_wo     	  	             boolean default True,
  wts_task     	  	           boolean default True,
  wts_valid                    boolean default True,
  usr_cre_id                   integer references nomad.user(id),
  usr_mod_id                   integer references nomad.user(id),
  wts_dcre                     timestamp without time zone  default current_timestamp,
  wts_dmod                     timestamp without time zone  default current_timestamp
);

create table if not exists workorder_task_reason
(
  id                           serial primary key,
  wtr_code                     text not null,
  wtr_slabel	        	       text not null,
  wtr_llabel	        	       text,
  wtr_valid                    boolean default True,
  wtr_work_request             boolean default True,
  wtr_report                   boolean default True,
  wtr_wo     	  	             boolean default True,
  wtr_task     	  	           boolean default True,
  usr_cre_id                   integer references nomad.user(id),
  usr_mod_id                   integer references nomad.user(id),
  wtr_dcre                     timestamp without time zone  default current_timestamp,
  wtr_dmod                     timestamp without time zone  default current_timestamp
);

create table if not exists asset_type_wtr
(
  wtr_id                       integer not null references workorder_task_reason(id),
  asset_type	        	       text not null references asset_type(code),
  ---
  usr_cre_id                   integer references nomad.user(id),
  usr_mod_id                   integer references nomad.user(id),
  wtx_dcre                     timestamp without time zone  default current_timestamp,
  wtx_dmod                     timestamp without time zone  default current_timestamp,
  primary key (wtr_id, asset_type)
);

create table if not exists workorder
(
  id                           bigserial primary key,
  -- Work order properties
  wko_name                     text,
  wko_external_app		         text,
  wko_external_id	             text,
  wko_creation_cell            text,
  wko_creation_comment         text,
  wko_emergency                boolean default False,
  wko_appointment              boolean default False,
  wko_address                  text,
  wko_street_number            text,
  wko_planning_start_date	     timestamp without time zone,
  wko_planning_end_date	       timestamp without time zone,
  wko_completion_date	         timestamp without time zone,
  wko_realization_user         text,
  wko_realization_cell         text,
  wko_realization_comment      text,
  ------
  usr_cre_id                   integer references nomad.user(id),
  usr_mod_id                   integer references nomad.user(id),
  wko_dmod                     timestamp without time zone  default current_timestamp,
  wko_dcre        	           timestamp without time zone  default current_timestamp,
  ------
  cty_code                     text,
  cty_name                     text,
  ------
  lyr_table_name		           text not null references layer(lyr_table_name),
  ------
  wts_id                       integer references workorder_task_status(id), -- status
  wtr_id                       integer references workorder_task_reason(id), -- reason
  ------
  str_id                       bigint,
  ------
  ctr_code                     text references contract(ctr_code),
  ------
  water_stop_id                bigint,
  program_id                   bigint,
  worksite_id                  bigint, -- FIXME: territoirre ? pourquoi le mettre dans les workorder ?
  delivery_point_id            bigint,
  ------
  longitude                    numeric,
  latitude                     numeric,
  geom                         geometry('POINT', :srid)
);

create table if not exists task
(
  id                           bigserial primary key,
  wko_id		                   bigint references workorder(id),
  tsk_name                     text,
  lyr_table_name		           text not null references layer(lyr_table_name),
  wts_id                       integer references workorder_task_status(id), -- status
  wtr_id                       integer references workorder_task_reason(id), -- reason
  tsk_comment                  text,
  ctr_code                     text references contract(ctr_code),
  fea_id                       text, -- FIXME uuid ou ID Vigie préfixé
  tsk_planning_start_date	     timestamp without time zone,
  tsk_planning_end_date	       timestamp without time zone,
  tsk_completion_date	         timestamp without time zone,
  tsk_realization_user         bigint,
  usr_cre_id                   integer references nomad.user(id),
  usr_mod_id                   integer references nomad.user(id),
  tsk_dcre        	           timestamp without time zone  default current_timestamp,
  tsk_dmod                     timestamp without time zone  default current_timestamp,
  --------
  longitude                    numeric,
  latitude                     numeric,
  geom                         geometry('POINT', :srid)
);

create table if not exists report(
  id                           bigserial primary key,
  tsk_id                       bigint,
  rpt_report_date              timestamp without time zone  default current_timestamp,
  usr_cre_id                   integer references nomad.user(id),
  usr_mod_id                   integer references nomad.user(id),
  rpt_dcre                     timestamp without time zone  default current_timestamp,
  rpt_dmod                     timestamp without time zone  default current_timestamp,
  rpt_detail                   jsonb
);



create table if not exists report_field(
  id                           bigserial primary key,
  rpf_code                     text,
  rpf_slabel	        	       text,
  rpf_llabel	        	       text,
  rpf_valid                    boolean default true,
  usr_cre_id                   integer references nomad.user(id),
  usr_mod_id                   integer references nomad.user(id),
  rpf_dcre                     timestamp without time zone  default current_timestamp,
  rpf_dmod                     timestamp without time zone  default current_timestamp
);
