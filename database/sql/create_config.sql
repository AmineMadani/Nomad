\encoding UTF8

/****************************************************
 * Scripts to Create config objects in the database *
 ****************************************************/

set search_path to nomad, public;

-- Float Setting
create table float_setting (
    name text primary key
  , value double precision
);
/* Comments on table */
comment on table float_setting is 'This table defines the float settings.';
/* Comments on fields */
comment on column float_setting.name is 'Setting name';
comment on column float_setting.value is 'Setting value';

-- Text Setting
create table text_setting (
    name text primary key
  , value text
);
/* Comments on table */
comment on table text_setting is 'This table defines the text settings.';
/* Comments on fields */
comment on column text_setting.name is 'Setting name';
comment on column text_setting.value is 'Setting value';

--
-- User appication
-- This table defines the application users.
create table users
(
  id                bigserial primary key,
  usr_first_name    text not null,
  usr_last_name	    text not null,
  usr_email	        text unique not null,
  -- Technical metadata
  usr_valid         boolean default True,
  usr_ucre_id       bigint default 0,
  usr_umod_id       bigint default 0,
  usr_dcre          timestamp without time zone  default current_timestamp,
  usr_dmod          timestamp without time zone  default current_timestamp,
  usr_configuration text
);
/* Comments on table */
comment on table users is 'This table defines the application users.';
/* Comments on fields */
comment on column users.id is 'Table unique ID';
comment on column users.usr_first_name is 'First name';
comment on column users.usr_last_name is 'Last name';
comment on column users.usr_email is 'User email';
comment on column users.usr_valid is 'If valid, true else false';
comment on column users.usr_ucre_id is 'Creator Id';
comment on column users.usr_umod_id is 'Last Modificator Id';
comment on column users.usr_dcre is 'Creation date';
comment on column users.usr_dmod is 'Last modification date';
comment on column users.usr_configuration is 'User configuration';

insert into users(id, usr_first_name, usr_last_name, usr_email) values (0, 'administrator', 'administrator', 'administrator@veolia.com');

ALTER TABLE users
ADD CONSTRAINT fk_usr_ucre_id
FOREIGN KEY (usr_ucre_id)
REFERENCES users (id);

ALTER TABLE users
ADD CONSTRAINT fk_usr_umod_id
FOREIGN KEY (usr_umod_id)
REFERENCES users (id);

--
-- Domain appication type
-- This table defines the core domains application.
-- Layers and business objects are referenced to a domain
-- A domain can have child domains, for example, the asset
-- Domain can be divided in 2 sub domains : drinking water, ans waste water
--

create table domains
(
  id                           bigserial primary key,
	dom_type                     text unique not null,
	dom_parent_id                bigint  references domains(id),
	dom_slabel                    text,
	dom_llabel                    text,
  -- Technical metadata
  dom_valid                    boolean default True,
	dom_ucre_id                  bigint references users(id) default 0,
  dom_umod_id                  bigint references users(id) default 0,
  dom_dcre                     timestamp without time zone  default current_timestamp,
  dom_dmod                     timestamp without time zone  default current_timestamp
);

/* Comments on table */
comment on table domains is 'This table lists up all the application domains: drinking water, sewage water...';
/* Comments on fields */
comment on column domains.id is 'Table unique ID';
comment on column domains.dom_type is 'Type of the domain, used to prefix domain related objects';
comment on column domains.dom_parent_id is 'Parent Id';
comment on column domains.dom_slabel is 'Short label (alias) of the domain';
comment on column domains.dom_llabel is 'Long label (alias) of the domain';
comment on column domains.dom_valid is 'If valid, true else false';
comment on column domains.dom_ucre_id is 'creator Id';
comment on column domains.dom_umod_id is 'Last modificator Id';
comment on column domains.dom_dcre is 'Creation date';
comment on column domains.dom_dmod is 'Last Modification date';

-- Value Lists
-- List of topological famility
-- gives topological behabiour for business object

create table vl_topology_type
(
    id bigserial primary key,
    tpt_type text unique not null,
    tpt_required_fields text[],
    -- Technical metadata
    tpt_valid         boolean default True,
	  tpt_ucre_id       bigint references users(id) default 0,
    tpt_umod_id       bigint references users(id) default 0,
    tpt_dcre          timestamp without time zone  default current_timestamp,
    tpt_dmod          timestamp without time zone  default current_timestamp
);
/* Comments on table */
comment on table vl_topology_type is 'This table defines List of topological familiy and gives topological behabiour for business object';
/* Comments on fields */
comment on column vl_topology_type.id is 'Table unique ID';
comment on column vl_topology_type.tpt_type is 'Type Name';
comment on column vl_topology_type.tpt_required_fields is 'List of topological behabiour for business object';
comment on column vl_topology_type.tpt_valid is 'If valid, true else false';
comment on column vl_topology_type.tpt_ucre_id is 'creator Id';
comment on column vl_topology_type.tpt_umod_id is 'Last modificator Id';
comment on column vl_topology_type.tpt_dcre is 'Creation date';
comment on column vl_topology_type.tpt_dmod is 'Last modification date';

insert into vl_topology_type(tpt_type, tpt_required_fields)
  values
  ('arc' , null)--'{start_node,end_node}')
, ('node' , null)
, ('point', null)
, ('lateral_line', null)--'{arc_id}')
, ('lateral_node', null)
, ('lateral_point', null);

-- asset_type
-- This table defines the asset type, 
create table asset_type
(
    id bigserial primary key,
    dom_id bigint references domains(id),
    ast_code text unique not null, -- code hérité de CANOPE / PICRU (20, 21...)
    ast_slabel text,
    ast_llabel text,
    -- Technical metadata
    ast_valid         boolean default True,
    ast_ucre_id       bigint references users(id) default 0,
    ast_umod_id       bigint references users(id) default 0,
    ast_dcre          timestamp without time zone  default current_timestamp,
    ast_dmod          timestamp without time zone  default current_timestamp
);
/* Comments on table */
comment on table asset_type is 'This table defines all the different types of asset';
/* Comments on fields */
comment on column asset_type.id is 'Table unique ID';
comment on column asset_type.dom_id is 'Application domain (ie: drinking water, ...) Id';
comment on column asset_type.ast_code is 'Code asset type';
comment on column asset_type.ast_slabel is 'Short label asset type';
comment on column asset_type.ast_llabel is 'Long label asset type';
comment on column asset_type.ast_valid is 'If valid, true else false';
comment on column asset_type.ast_ucre_id is 'creator Id';
comment on column asset_type.ast_umod_id is 'Last modificator Id';
comment on column asset_type.ast_dcre is 'Creation date';
comment on column asset_type.ast_dmod is 'Last modification date';

-- Layer
-- This table defines all the layers available in the app.
create table layer
(
    id                       bigserial primary key,
    lyr_num_order            integer,
    dom_id                   bigint references domains(id),
    ast_id                   bigint references asset_type(id) ,-- code hérité de CANOPE / PICRU (20, 21...)
    lyr_table_name           text unique not null,
    lyr_geom_column_name     text not null,
    lyr_uuid_column_name     text not null,
    lyr_geom_srid            text not null,
    lyr_slabel               text,
	  lyr_llabel               text,
	  lyr_display              boolean default True,
	  -- Technical metadata
    lyr_valid                boolean default True,
    lyr_ucre_id              bigint references users(id) default 0,
    lyr_umod_id              bigint references users(id) default 0,
    lyr_dcre                 timestamp without time zone  default current_timestamp,
    lyr_dmod                 timestamp without time zone  default current_timestamp
);

/* Comments on table */
comment on table layer is 'This table defines all the layers available in the app';
/* Comments on fields */
comment on column layer.id is 'Table unique ID';
comment on column layer.lyr_num_order is 'lyr_num_order';
comment on column layer.dom_id is 'Application domain (ie: drinking water, ...) Id';
comment on column layer.lyr_table_name is 'Table that contains the layer features (regclass format)';
comment on column layer.lyr_geom_column_name is  'Column name that contains features geometry';
comment on column layer.lyr_uuid_column_name is 'Column name that contains unique ID';
comment on column layer.lyr_geom_srid is  'SRID of the features geometry';
comment on column layer.lyr_slabel is 'Short Label of the layer';
comment on column layer.lyr_llabel is 'Long Label of the layer';
comment on column layer.lyr_display is 'lyr_display';
comment on column layer.lyr_valid is 'If valid, true else false';
comment on column layer.lyr_ucre_id is 'creator Id';
comment on column layer.lyr_umod_id is 'Last modificator Id';
comment on column layer.lyr_dcre is 'Creation date';
comment on column layer.lyr_dmod is 'Last modification date';

-- Basemaps
-- This table defines all the basemaps available in the app.

create table basemaps
(
    id                bigserial primary key,
    map_slabel        text,
    map_llabel        text,
    map_type          text,
    map_url           text,
    map_layer         text,
    map_matrixset     text,
    map_format        text,
    map_projection    text,
    map_tilegrid      text,
    map_style         text,
    map_attributions  text,
    map_default       boolean default false,
    map_display       boolean default false,
    map_thumbnail     bytea,
	  -- Technical metadata
    map_valid         boolean default True,
    map_ucre_id       bigint references users(id) default 0,
    map_umod_id       bigint references users(id) default 0,
    map_dcre          timestamp without time zone  default current_timestamp,
    map_dmod          timestamp without time zone  default current_timestamp
);

/* Comments on table */
comment on table basemaps is 'This table defines all the raster layers available in the app';
/* Comments on fields */
comment on column basemaps.id is 'Table unique ID';
comment on column basemaps.map_slabel is 'Basemap Short Label';
comment on column basemaps.map_llabel is 'Basemap Long Label';
comment on column basemaps.map_type is 'Basemap  ty:pe (WMTS, WMS...)';
comment on column basemaps.map_url is 'Basemap URL';
comment on column basemaps.map_layer is 'Layer to display';
comment on column basemaps.map_matrixset is 'Matrix set';
comment on column basemaps.map_format is 'Format (png...)';
comment on column basemaps.map_projection is 'Format (png...)';
comment on column basemaps.map_tilegrid is 'Tile grid';
comment on column basemaps.map_style is 'Style';
comment on column basemaps.map_attributions is 'WS attributions';
comment on column basemaps.map_default is 'Default basemap';
comment on column basemaps.map_display is 'Display basemap';
comment on column basemaps.map_thumbnail is 'Image thumbnail';
comment on column basemaps.map_valid is 'If valid, true else false';
comment on column basemaps.map_ucre_id is 'creator Id';
comment on column basemaps.map_umod_id is 'Last modificator Id';
comment on column basemaps.map_dcre is 'Creation date';
comment on column basemaps.map_dmod is 'Last modification date';

-- Create table to store a grid that covers all asset
-- Used to export GeoJson
create table app_grid
(
    id                bigserial primary key,
	  -- Technical metadata
    agr_valid         boolean default True,
    agr_ucre_id       bigint references users(id) default 0,
    agr_umod_id       bigint references users(id) default 0,
    agr_dcre          timestamp without time zone  default current_timestamp,
    agr_dmod          timestamp without time zone  default current_timestamp,
    -- Geometry
    geom              geometry('Polygon', 3857)
);

create index on app_grid using gist(geom);

/* Comments on table */
comment on table app_grid is 'This table defines the grid to export geojson';
/* Comments on fields */
comment on column app_grid.id is 'Table unique ID';
comment on column app_grid.agr_valid is 'If valid, true else false';
comment on column app_grid.agr_ucre_id is 'creator Id';
comment on column app_grid.agr_umod_id is 'Last modificator Id';
comment on column app_grid.agr_dcre is 'Creation date';
comment on column app_grid.agr_dmod is 'Last modification date';
comment on column app_grid.geom is 'Geometry of the grid';;

-- Create table layer_references to store the corresponding columns for each layers
CREATE TABLE layer_references(
    id                 bigserial PRIMARY KEY,
    lyr_id             bigint NOT NULL REFERENCES layer(id),
    lrf_reference_key  text NOT NULL,
    lrf_slabel          text,
    lrf_llabel          text,
    -- Technical metadata
    lrf_valid          boolean default True,
    lrf_ucre_id        bigint references users(id) default 0,
    lrf_umod_id        bigint references users(id) default 0,
    lrf_dcre           timestamp without time zone  default current_timestamp,
    lrf_dmod           timestamp without time zone  default current_timestamp
);
/* Comments on table */
comment on table layer_references is 'This table defines the corresponding columns (reference_key) for each layers';
/* Comments on fields */
comment on column layer_references.id is 'Table unique ID';
comment on column layer_references.lyr_id is 'Layer Id';
comment on column layer_references.lrf_reference_key is 'Reference key. It is the column name in the layer table';
comment on column layer_references.lrf_slabel is  'Short label to display in the app';
comment on column layer_references.lrf_llabel is  'Long label (Alias) to display in the app';
comment on column layer_references.lrf_valid is 'If valid, true else false';
comment on column layer_references.lrf_ucre_id is 'creator Id';
comment on column layer_references.lrf_umod_id is 'Last modificator Id';
comment on column layer_references.lrf_dcre is 'Creation date';
comment on column layer_references.lrf_dmod is 'Last modification date';

CREATE TYPE layer_references_display_type AS ENUM ('SYNTHETIC','DETAILED');
CREATE CAST (character varying AS nomad.layer_references_display_type)
WITH INOUT AS IMPLICIT;

-- Create table layer_references_default to store the default display_type and position for each layer_references
CREATE TABLE layer_references_default(
    id                bigserial PRIMARY KEY,
    lrd_id            bigint not null references layer_references (id),
    lrd_position      int not null,
    lrd_section       text,
    lrd_isvisible     boolean default true,
    lrd_display_type  layer_references_display_type NOT NULL,
    -- Technical metadata
    lrd_valid         boolean default True,
    lrd_ucre_id       bigint references users(id) default 0,
    lrd_umod_id       bigint references users(id) default 0,
    lrd_dcre          timestamp without time zone  default current_timestamp,
    lrd_dmod          timestamp without time zone  default current_timestamp
);
/* Comments on table */
comment on table layer_references_default is 'This table defines the default display_type and position for each layer_references in the app';
/* Comments on fields */
comment on column layer_references_default.id is 'Table unique ID';
comment on column layer_references_default.lrd_id is 'Layer reference ID';
comment on column layer_references_default.lrd_position is 'Position in the app';
comment on column layer_references_default.lrd_section is 'Section to group properties';
comment on column layer_references_default.lrd_isvisible is 'If visible, true else false';
comment on column layer_references_default.lrd_display_type is  'Display type (SYNTHETIC or DETAILED)';
comment on column layer_references_default.lrd_valid is 'If valid, true else false';
comment on column layer_references_default.lrd_ucre_id is 'creator Id';
comment on column layer_references_default.lrd_umod_id is 'Last modificator Id';
comment on column layer_references_default.lrd_dcre is 'Creation date';
comment on column layer_references_default.lrd_dmod is 'Last modification date';

-- Create table layer_references_user to store the user display_type and position for each layer_references
CREATE TABLE layer_references_user(
    id               bigserial     PRIMARY KEY NOT NULL,
    lrf_id           bigint NOT NULL REFERENCES layer_references (id),
    lru_user_id      bigint NOT NULL REFERENCES users(id),
    lru_position     INT NOT NULL,
    lru_display_type layer_references_display_type NOT NULL,
    lru_section      text,
    lru_isvisible    boolean default true,
    -- Technical metadata
    lru_valid        boolean default True,
    lru_ucre_id      bigint references users(id) default 0,
    lru_umod_id      bigint references users(id) default 0,
    lru_dcre         timestamp without time zone  default current_timestamp,
    lru_dmod         timestamp without time zone  default current_timestamp
);
/* Comments on table */
comment on table layer_references_user is 'This table defines the user display_type and position for each layer_references in the app';
/* Comments on fields*/
comment on column layer_references_user.id is 'Table unique ID';
comment on column layer_references_user.lrf_id is 'Layer reference Id';
comment on column layer_references_user.lru_user_id is 'User id';
comment on column layer_references_user.lru_position is 'Position in the app';
comment on column layer_references_user.lru_display_type is 'Display type (SYNTHETIC or DETAILED)';
comment on column layer_references_user.lru_section is 'Section to group properties';
comment on column layer_references_user.lru_isvisible is 'If visible, true else false';
comment on column layer_references_user.lru_valid is 'If valid, true else false';
comment on column layer_references_user.lru_ucre_id is 'creator Id';
comment on column layer_references_user.lru_umod_id is 'Last modificator Id';
comment on column layer_references_user.lru_dcre is 'Creation date';
comment on column layer_references_user.lru_dmod is 'Last modification date';

-- Table contract_activity
-- Define the activity of a contract
create table if not exists  contract_activity(
  id          bigserial primary key,
  cta_code    text unique not null,
  cta_slabel  text,
  cta_llabel	text,
  -- Technical metadata
  cta_valid   boolean default true,
  cta_ucre_id bigint references users(id) default 0,
  cta_umod_id bigint references users(id) default 0,
  cta_dcre    timestamp without time zone  default current_timestamp,
  cta_dmod    timestamp without time zone  default current_timestamp
);
/* Comments on table */
comment on table contract_activity is 'This table defines the activity of a contract';
/* Comments on fields*/
comment on column contract_activity.id is 'Table unique ID';
comment on column contract_activity.cta_code is 'Code of the activity';
comment on column contract_activity.cta_slabel is 'Short label of the activity';
comment on column contract_activity.cta_llabel is 'Long label of the activity';
comment on column contract_activity.cta_valid is 'If valid, true else false';
comment on column contract_activity.cta_ucre_id is 'creator Id';
comment on column contract_activity.cta_umod_id is 'Last modificator Id';
comment on column contract_activity.cta_dcre is 'Creation date';
comment on column contract_activity.cta_dmod is 'Last modification date';

-- Table contract
-- Contains the contracts 
--FIXME manque la notion d'exploitant / de DICT / DSP ou Hors DSP / statut . Type client
create table if not exists contract(
  id                           bigserial primary key,
  ctr_code                     text unique,
  ctr_slabel	        	       text,
  ctr_llabel	        	       text,
  ctr_start_date               timestamp without time zone,
  ctr_end_date                 timestamp without time zone,
  cta_id                       bigint references contract_activity(id),
  -- Technical metadata
  ctr_valid                    boolean default True,
  ctr_ucre_id                  bigint references users(id) default 0,
  ctr_umod_id                  bigint references users(id) default 0,
  ctr_dcre                     timestamp without time zone  default current_timestamp,
  ctr_dmod                     timestamp without time zone  default current_timestamp,
  -- Geometry
  geom                         geometry('MULTIPOLYGON', 3857)
);
create index on contract using gist(geom);
/* Comments on table */
comment on table contract is 'This table contains the contracts';
/* Comments on fields */
comment on column contract.id is 'Table unique ID';
comment on column contract.ctr_code is 'Code of the contract';
comment on column contract.ctr_slabel is 'short label of the contract';
comment on column contract.ctr_llabel is 'long label of the contract';
comment on column contract.ctr_start_date is 'Start date of the contract';
comment on column contract.ctr_end_date is 'Start date of the contract';
comment on column contract.ctr_valid is 'If valid, true else false';
comment on column contract.ctr_ucre_id is 'creator Id';
comment on column contract.ctr_umod_id is 'Last modificator Id';
comment on column contract.ctr_dcre is 'Creation date';
comment on column contract.ctr_dmod is 'Last modification date';
comment on column contract.cta_id is 'Activity of the contract';
comment on column contract.geom is 'geometry of the contract';

-- Table contract
-- Contains the cities
create table if not exists city(
  id           bigserial primary key,
  cty_code     text unique,
  cty_slabel   text,
  cty_llabel   text,
  -- Technical metadata
  cty_valid    boolean default True, 
  cty_ucre_id  bigint references users(id) default 0,
  cty_umod_id  bigint references users(id) default 0,
  cty_dcre     timestamp without time zone  default current_timestamp,
  cty_dmod     timestamp without time zone  default current_timestamp,
  -- Geometry
  geom         geometry('MULTIPOLYGON', 3857)
);
create index on city using gist(geom);

/* Comments on table */
comment on table city is 'This table contains the cities';
/* Comments on fields */
comment on column city.id is 'Table unique ID';
comment on column city.cty_code is 'Insee code of the city';
comment on column city.cty_slabel is 'Short name of the city';
comment on column city.cty_llabel is 'Long name of the city';
comment on column city.cty_valid is 'If valid, true else false';
comment on column city.cty_ucre_id is 'creator Id';
comment on column city.cty_umod_id is 'Last modificator Id';
comment on column city.cty_dcre is 'Creation date';
comment on column city.cty_dmod is 'Last modification date';
comment on column city.geom is 'Geometry of the city';

-- Table street
-- Contains the streets
create table if not exists street(
id           bigserial primary key,
cty_id       bigint references city(id),
str_code     text,
str_slabel	 text,
str_llabel	 text,
str_source	 text,
-- Technical metadata
str_valid    boolean default True,
str_ucre_id  bigint references users(id) default 0,
str_umod_id  bigint references users(id) default 0,
str_dcre     timestamp without time zone  default current_timestamp,
str_dmod     timestamp without time zone  default current_timestamp,
-- Geometry
geom         geometry('multilinestring', :srid)
);
create index on street using gist(geom);

/* Comments on table */
comment on table street is 'This table contains the streets';
/* Comments on fields */
comment on column street.id is 'Table unique ID';
comment on column street.cty_id is 'Id of the city';
comment on column street.str_code is 'Code of the street';
comment on column street.str_slabel is 'Short label of the street';
comment on column street.str_llabel is 'Long label of the street';
comment on column street.str_source is 'Source of the data';
comment on column street.str_valid is 'If valid, true else false';
comment on column street.str_ucre_id is 'creator Id';
comment on column street.str_umod_id is 'Last modificator Id';
comment on column street.str_dcre is 'Creation date';
comment on column street.str_dmod is 'Last modification date';
comment on column street.geom is 'Geometry of the street';

-- Table workorder_task_status
-- Contains the status of the workorder and task
create table if not exists workorder_task_status
(
  id           bigserial primary key,
  wts_code     text unique not null,
  wts_slabel   text not null,
  wts_llabel   text,
  wts_wo       boolean default True,
  wts_task     boolean default True,
  -- Technical metadata
  wts_valid    boolean default True,
  wts_ucre_id  bigint references users(id) default 0,
  wts_umod_id  bigint references users(id) default 0,
  wts_dcre     timestamp without time zone  default current_timestamp,
  wts_dmod     timestamp without time zone  default current_timestamp
);
/* Comments on table */
comment on table workorder_task_status is 'This table contains the status of the workorder and task';
/* Comments on fields */
comment on column workorder_task_status.id is 'Table unique ID';
comment on column workorder_task_status.wts_code is 'Code of the status';
comment on column workorder_task_status.wts_slabel is 'Short label of status';
comment on column workorder_task_status.wts_llabel is 'Long label of status';
comment on column workorder_task_status.wts_wo is 'If workorders use this status, true else false';
comment on column workorder_task_status.wts_task is 'If tasks use this status';
comment on column workorder_task_status.wts_valid is 'If valid, true else false';
comment on column workorder_task_status.wts_ucre_id is 'creator Id';
comment on column workorder_task_status.wts_umod_id is 'Last modificator Id';
comment on column workorder_task_status.wts_dcre is 'Creation date';
comment on column workorder_task_status.wts_dmod is 'Last modification date';

-- Table workorder_task_reason
-- Contains the reason of the workorder and task
create table if not exists workorder_task_reason
(
  id                bigserial primary key,
  wtr_code          text unique not null,
  wtr_slabel        text not null,
  wtr_llabel        text,
  wtr_work_request  boolean default True,
  wtr_report        boolean default True,
  wtr_wo            boolean default True,
  wtr_task          boolean default True,
  -- Technical metadata
  wtr_valid         boolean default True,
  wtr_ucre_id       bigint references users(id) default 0,
  wtr_umod_id       bigint references users(id) default 0,
  wtr_dcre          timestamp without time zone  default current_timestamp,
  wtr_dmod          timestamp without time zone  default current_timestamp
);
/* Comments on table */
comment on table workorder_task_reason is 'This table contains the reason of the workorder and task';
/* Comments on fields */
comment on column workorder_task_reason.id is 'Table unique ID';
comment on column workorder_task_reason.wtr_code is 'Code of the reason';
comment on column workorder_task_reason.wtr_slabel is 'Short label of reason';
comment on column workorder_task_reason.wtr_llabel is 'Long label of reason';
comment on column workorder_task_reason.wtr_work_request is 'If work request use the reason, true else false';
comment on column workorder_task_reason.wtr_report is 'If report request use the reason, true else false';
comment on column workorder_task_reason.wtr_wo is 'If workorder use the reason, true else false';
comment on column workorder_task_reason.wtr_task is 'If task reason, true else false';
comment on column workorder_task_reason.wtr_valid is 'If valid, true else false';
comment on column workorder_task_reason.wtr_ucre_id is 'creator Id';
comment on column workorder_task_reason.wtr_umod_id is 'Last modificator Id';
comment on column workorder_task_reason.wtr_dcre is 'Creation date';
comment on column workorder_task_reason.wtr_dmod is 'Last modification date';

-- Table ast_wtr
-- Contains the link between workorder_task reason and asset type
create table if not exists ast_wtr
(
  wtr_id       bigint not null references workorder_task_reason(id),
  ast_id       bigint not null references asset_type(id),
  -- Technical metadata
  asw_valid    boolean default True,
  asw_ucre_id  bigint references users(id),
  asw_umod_id  bigint references users(id),
  asw_dcre     timestamp without time zone  default current_timestamp,
  asw_dmod     timestamp without time zone  default current_timestamp,
  primary key (wtr_id, ast_id)
);
/* Comments on table */
comment on table ast_wtr is 'This table contains the reason of the workorder and task';
/* Comments on fields */
comment on column ast_wtr.wtr_id is 'workerorder/Task Reason id';
comment on column ast_wtr.ast_id is 'asset id';
comment on column ast_wtr.asw_valid is 'If valid, true else false';
comment on column ast_wtr.asw_ucre_id is 'creator Id';
comment on column ast_wtr.asw_umod_id is 'Last modificator Id';
comment on column ast_wtr.asw_dcre is 'Creation date';
comment on column ast_wtr.asw_dmod is 'Last modification date';


-- Table asset
-- Contains the assets referenced in a workorder or a task
create table if not exists asset(
id                           bigserial primary key,
ass_obj_ref                  text,
ass_obj_table                text NOT NULL REFERENCES layer(lyr_table_name),
-- Technical metadata
ass_valid                    boolean default True,
ass_ucre_id                  bigint references users(id) default 0,
ass_umod_id                  bigint references users(id) default 0,
ass_dcre                     timestamp without time zone  default current_timestamp,
ass_dmod                     timestamp without time zone  default current_timestamp
);
/* Comments on table */
comment on table asset is 'This table containsthe assets referenced in a workorder or a task';
/* Comments on fields */
comment on column asset.id is 'Table unique ID';
comment on column asset.ass_obj_ref is 'Patrimo,ial Object Reference (uuid)';
comment on column asset.ass_obj_table is 'Associated table in the patrimonial schema';
comment on column asset.ass_valid is 'If valid, true else false';
comment on column asset.ass_ucre_id is 'creator Id';
comment on column asset.ass_umod_id is 'Last modificator Id';
comment on column asset.ass_dcre is 'Creation date';
comment on column asset.ass_dmod is 'Last modification date';

-- Table workorder
-- Contains the workorders
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
  wko_agent_nb                 INT,
  ------
  cty_id                       bigint references city(id),
  cty_llabel                   text,
  ------
  wts_id                       bigint references workorder_task_status(id), -- status
  ------
  str_id                       bigint references street(id),
  str_llabel                   text,
  ------
  /*
  water_stop_id                bigint,
  program_id                   bigint,
  worksite_id                  bigint, -- FIXME: territoirre ? pourquoi le mettre dans les workorder ?
  delivery_point_id            bigint,
  */
  ------
  -- Technical metadata
  wko_ucre_id                  bigint references users(id) default 0,
  wko_umod_id                  bigint references users(id) default 0,
  wko_dmod                     timestamp without time zone  default current_timestamp,
  wko_dcre        	           timestamp without time zone  default current_timestamp,
  wko_ddel                     timestamp without time zone default null,
  ------
  -- Geometry
  longitude                    numeric,
  latitude                     numeric,
  geom                         geometry('POINT', 3857),
  -- external app
  wko_ext_ref                  text,
  wko_ext_date_sync            timestamp without time zone default null,
  wko_ext_error                text,
  wko_ext_to_sync              boolean default False
);
create index on workorder using gist(geom);
/* Comments on table */
comment on table workorder is 'This table contains the workorders';
/* Comments on fields */
comment on column workorder.id is 'Table unique ID';
comment on column workorder.wko_name is 'Name of the workorder';
comment on column workorder.wko_external_app is 'External application';
comment on column workorder.wko_external_id is 'External id of the workorder';
comment on column workorder.wko_creation_cell is 'Creation cell of the workorder';
comment on column workorder.wko_creation_comment is 'comment of the workorder';
comment on column workorder.wko_emergency is 'If emergency, true else false'; 
comment on column workorder.wko_appointment is 'If appointment, true else false'; 
comment on column workorder.wko_address is 'Address of the workorder';
comment on column workorder.wko_street_number is 'Street number of the workorder';
comment on column workorder.wko_planning_start_date is 'Planning start date of the workorder';
comment on column workorder.wko_planning_end_date is 'Planning end date of the workorder';
comment on column workorder.wko_completion_date is 'Completion date of the workorder';
comment on column workorder.wko_realization_user is 'Realization user of the workorder';
comment on column workorder.wko_realization_cell is 'Realization cell of the workorder';
comment on column workorder.wko_realization_comment is 'Realization comment of the workorder';
comment on column workorder.cty_id is 'City';
comment on column workorder.cty_llabel is 'Long label of the city';
comment on column workorder.wts_id is 'Workorder status ';
comment on column workorder.str_id is 'Street';
comment on column workorder.str_llabel is 'Long label of the street';
COMMENT ON COLUMN workorder.wko_agent_nb IS 'Number of agent';
comment on column workorder.wko_ucre_id is 'creator Id';
comment on column workorder.wko_umod_id is 'Last modificator Id';
comment on column workorder.wko_dmod is 'Last modification date';
comment on column workorder.wko_dcre is 'Creation date';
comment on column workorder.wko_ddel is 'Deletion date';
comment on column workorder.longitude is 'longitude';
comment on column workorder.latitude is 'latitude';
comment on column workorder.geom is 'Geometry of the workorder';
COMMENT ON COLUMN workorder.wko_ext_ref IS 'External reference of the workorder';
COMMENT ON COLUMN workorder.wko_ext_date_sync IS 'Last date of synchronization with an external application';
COMMENT ON COLUMN workorder.wko_ext_to_sync IS 'True if there is a need to synchronize the workorder with the external app';
COMMENT ON COLUMN workorder.wko_ext_error IS 'Error message during synchronisation';

-- Table task
-- Contains the tasks
create table if not exists task
(
  id                       bigserial primary key,
  wko_id		               bigint references workorder(id),
  tsk_name                 text,
  wts_id                   bigint references workorder_task_status(id), -- status
  wtr_id                   bigint references workorder_task_reason(id), -- reason
  tsk_comment              text,
  ctr_id                   bigint references contract(id),
  ass_id                   bigint references  asset(id), 
  tsk_planning_start_date  timestamp without time zone,
  tsk_planning_end_date	   timestamp without time zone,
  tsk_completion_date	     timestamp without time zone,
  tsk_realization_user     bigint,
  tsk_report_date          timestamp without time zone,
  -- Technical metadata
  tsk_ucre_id              bigint references users(id) default 0,
  tsk_umod_id              bigint references users(id) default 0,
  tsk_dcre        	       timestamp without time zone  default current_timestamp,
  tsk_dmod                 timestamp without time zone  default current_timestamp,
  tsk_ddel                 timestamp without time zone default null,
  --------
  longitude                numeric,
  latitude                 numeric,
  geom                     geometry('POINT', 3857)
);
create index on task using gist(geom);
/* Comments on table */
comment on table workorder is 'This table contains the workorders';
/* Comments on fields */
comment on column task.id is 'Table unique ID';
comment on column task.wko_id is 'Workorder';
comment on column task.tsk_name is 'Name of the task';
comment on column task.wts_id is 'Task status';
comment on column task.wtr_id is 'Task reason';
comment on column task.tsk_comment is 'Comment of the task';
comment on column task.ctr_id is 'Contract';
comment on column task.ass_id is 'Asset';
comment on column task.tsk_planning_start_date is 'Planning start date of the task';
comment on column task.tsk_planning_end_date is 'Planning end date of the task';
comment on column task.tsk_completion_date is 'Completion date of the task';
comment on column task.tsk_realization_user is 'Realization user of the task';
comment on column task.tsk_report_date is 'Date of the report';
comment on column task.tsk_ucre_id is 'creator Id';
comment on column task.tsk_umod_id is 'Last modificator Id';
comment on column task.tsk_dcre is 'Creation date';
comment on column task.tsk_dmod is 'Last modification date';
comment on column task.tsk_ddel is 'Deletion date';
comment on column task.longitude is 'longitude';
comment on column task.latitude is 'latitude';
comment on column task.geom is 'Geometry of the task';

-- Table task
-- Contains the reports
create table if not exists report(
  id                           bigserial primary key,
  tsk_id                       bigint references task(id),
  rpt_key                      text,
  rpt_label                    text,
  rpt_value                    text,
  -- Technical metadata
  rpt_ucre_id                   bigint references users(id) default 0,
  rpt_umod_id                   bigint references users(id) default 0,
  rpt_dcre                     timestamp without time zone  default current_timestamp,
  rpt_dmod                     timestamp without time zone  default current_timestamp,
  rpt_ddel                     timestamp without time zone default null
);
/* Comments on table */
comment on table report is 'This table contains the reports';
/* Comments on fields */
comment on column report.id is 'Table unique ID';
comment on column report.tsk_id is 'Task';
comment on column report.rpt_report_date is 'Report date';
comment on column report.rpt_key is 'Report key';
comment on column report.rpt_label is 'Report question';
comment on column report.rpt_value is 'Report answer';
comment on column report.rpt_detail is 'Report detail on json format';
comment on column report.rpt_ucre_id is 'creator Id';
comment on column report.rpt_umod_id is 'Last modificator Id';
comment on column report.rpt_dcre is 'Creation date';
comment on column report.rpt_dmod is 'Last modification date';
comment on column report.rpt_ddel is 'Deletion date';


/*
create table if not exists report_field(
  id                           bigserial primary key,
  rpf_code                     text,
  rpf_slabel	        	   text,
  rpf_llabel	        	   text,
  rpf_valid                    boolean default true,
  rpf_cre_id                   bigint references users(id) default 0,
  rpf_mod_id                   bigint references users(id) default 0,
  rpf_dcre                     timestamp without time zone  default current_timestamp,
  rpf_dmod                     timestamp without time zone  default current_timestamp
);


create table if not exists report_form(
  id                        bigserial primary key,
  wtr_id                    bigint ,
  frm_code                  text,
  frm_slabel	        	text,
  frm_llabel	        	text,
  frm_valid                 boolean default true,
  frm_cre_id                bigint references users(id) default 0,
  frm_mod_id                bigint references users(id) default 0,
  frm_dcre                  timestamp without time zone  default current_timestamp,
  frm_dmod                  timestamp without time zone  default current_timestamp
);


create table if not exists frm_rpf(
  frm_id                       bigint,
  rpf_id	        	       bigint,
  frf_ucre_id                  bigint references users(id) default 0,
  frf_umod_id                  bigint references users(id) default 0,
  frf_dcre                     timestamp without time zone  default current_timestamp,
  frf_dmod                     timestamp without time zone  default current_timestamp,
  primary key (frm_id, rpf_id)
);
*/

-- Table form_definition
-- Contains the forms content
create table if not exists form_definition(
  id                           bigserial primary key,
  fdn_code                     text not null,
  fdn_definition               text not null,
  -- Technical metadata
  fdn_ucre_id                  bigint references users(id) default 0,
  fdn_umod_id                  bigint references users(id) default 0,
  fdn_dcre                     timestamp without time zone  default current_timestamp,
  fdn_dmod                     timestamp without time zone  default current_timestamp,
  fdn_ddel                     timestamp without time zone default null
);

/* Comments on table */
comment on table form_definition is 'This table contains the form definition';
/* Comments on fields */
comment on column form_definition.id is 'Table unique ID';
comment on column form_definition.fdn_code is 'The definition code';
comment on column form_definition.fdn_definition is 'The json definition';
comment on column form_definition.fdn_ucre_id is 'creator Id';
comment on column form_definition.fdn_umod_id is 'Last modificator Id';
comment on column form_definition.fdn_dcre is 'Creation date';
comment on column form_definition.fdn_dmod is 'Last modification date';
comment on column form_definition.fdn_ddel is 'Deletion date';


-- Table form_template
-- Contains the form template
create table if not exists form_template(
  id                           bigserial primary key,
  fte_code                     text not null,
  fdn_id                       bigint references form_definition(id) not null,
  -- Technical metadata
  fte_ucre_id                  bigint references users(id) default 0,
  fte_umod_id                  bigint references users(id) default 0,
  fte_dcre                     timestamp without time zone  default current_timestamp,
  fte_dmod                     timestamp without time zone  default current_timestamp,
  fte_ddel                     timestamp without time zone default null
);

/* Comments on table */
comment on table form_template is 'This table contains the form template';
/* Comments on fields */
comment on column form_template.id is 'Table unique ID';
comment on column form_template.fte_code is 'Code template';
comment on column form_template.fdn_id is 'The form definition';
comment on column form_template.fte_ucre_id is 'creator Id';
comment on column form_template.fte_umod_id is 'Last modificator Id';
comment on column form_template.fte_dcre is 'Creation date';
comment on column form_template.fte_dmod is 'Last modification date';
comment on column form_template.fte_ddel is 'Deletion date';

-- Table form_template_custom
-- Contains the form template custom
create table if not exists form_template_custom(
  id                           bigserial primary key,
  fte_id                       bigint references form_template(id) not null,
  usr_id                       bigint references users(id) not null,
  fdn_id                       bigint references form_definition(id) not null,
  -- Technical metadata
  ftc_ucre_id                  bigint references users(id) default 0,
  ftc_umod_id                  bigint references users(id) default 0,
  ftc_dcre                     timestamp without time zone  default current_timestamp,
  ftc_dmod                     timestamp without time zone  default current_timestamp,
  ftc_ddel                     timestamp without time zone default null
);

/* Comments on table */
comment on table form_template_custom is 'This table contains the form template custom';
/* Comments on fields */
comment on column form_template_custom.id is 'Table unique ID';
comment on column form_template_custom.fte_id is 'Form template ID';
comment on column form_template_custom.usr_id is 'User ID';
comment on column form_template_custom.fdn_id is 'The form definition';
comment on column form_template_custom.ftc_ucre_id is 'creator Id';
comment on column form_template_custom.ftc_umod_id is 'Last modificator Id';
comment on column form_template_custom.ftc_dcre is 'Creation date';
comment on column form_template_custom.ftc_dmod is 'Last modification date';
comment on column form_template_custom.ftc_ddel is 'Deletion date';

-- Table style definition
-- Contains the style definition
create table if not exists style_definition (
  id                           bigserial primary key,
  syd_code                     text not null,
  syd_definition               text not null,
  -- Technical metadata
  syd_ucre_id                  bigint references users(id) default 0,
  syd_umod_id                  bigint references users(id) default 0,
  syd_dcre                     timestamp without time zone  default current_timestamp,
  syd_dmod                     timestamp without time zone  default current_timestamp,
  syd_ddel                     timestamp without time zone default null
);

-- Table style image
-- Contains the style image
create table if not exists style_image (
  id                           bigserial primary key,
  syd_id                       bigint references style_definition(id) not null,
  syi_code                     text not null,
  syi_source                   text not null,
  -- Technical metadata
  syi_ucre_id                  bigint references users(id) default 0,
  syi_umod_id                  bigint references users(id) default 0,
  syi_dcre                     timestamp without time zone  default current_timestamp,
  syi_dmod                     timestamp without time zone  default current_timestamp,
  syi_ddel                     timestamp without time zone default null
);

/* Comments on table */
comment on table style_image is 'This table contains the style image';
/* Comments on fields */
comment on column style_image.id is 'Table unique ID';
comment on column style_image.syd_id is 'The style definition';
comment on column style_image.syi_code is 'The image code';
comment on column style_image.syi_source is 'The source';
comment on column style_image.syi_ucre_id is 'creator Id';
comment on column style_image.syi_umod_id is 'Last modificator Id';
comment on column style_image.syi_dcre is 'Creation date';
comment on column style_image.syi_dmod is 'Last modification date';
comment on column style_image.syi_ddel is 'Deletion date';

-- Table layer_style
-- Contains the styles for layers
create table if not exists layer_style (
  id                           bigserial primary key,
  lse_code                     text not null,
  syd_id                       bigint references style_definition(id) not null,
  lyr_id                       bigint references layer(id) not null,
  -- Technical metadata
  lse_ucre_id                  bigint references users(id) default 0,
  lse_umod_id                  bigint references users(id) default 0,
  lse_dcre                     timestamp without time zone  default current_timestamp,
  lse_dmod                     timestamp without time zone  default current_timestamp,
  lse_ddel                     timestamp without time zone default null
);

/* Comments on table */
comment on table layer_style is 'This table contains the form template';
/* Comments on fields */
comment on column layer_style.id is 'Table unique ID';
comment on column layer_style.lse_code is 'Code layer';
comment on column layer_style.syd_id is 'The style definition';
comment on column layer_style.lyr_id is 'The layer id';
comment on column layer_style.lse_ucre_id is 'creator Id';
comment on column layer_style.lse_umod_id is 'Last modificator Id';
comment on column layer_style.lse_dcre is 'Creation date';
comment on column layer_style.lse_dmod is 'Last modification date';
comment on column layer_style.lse_ddel is 'Deletion date';

-- Table layer_style_custom
-- Contains the layer style custom
create table if not exists layer_style_custom (
  id                           bigserial primary key,
  lse_id                       bigint references layer_style(id) not null,
  usr_id                       bigint references users(id) not null,
  syd_id                       bigint references style_definition(id) not null,
  -- Technical metadata
  lsc_ucre_id                  bigint references users(id) default 0,
  lsc_umod_id                  bigint references users(id) default 0,
  lsc_dcre                     timestamp without time zone  default current_timestamp,
  lsc_dmod                     timestamp without time zone  default current_timestamp,
  lsc_ddel                     timestamp without time zone default null
);

/* Comments on table */
comment on table layer_style_custom is 'This table contains the layer style custom';
/* Comments on fields */
comment on column layer_style_custom.id is 'Table unique ID';
comment on column layer_style_custom.lse_id is 'Layer style id';
comment on column layer_style_custom.usr_id is 'User ID';
comment on column layer_style_custom.syd_id is 'The style definition';
comment on column layer_style_custom.lsc_ucre_id is 'creator Id';
comment on column layer_style_custom.lsc_umod_id is 'Last modificator Id';
comment on column layer_style_custom.lsc_dcre is 'Creation date';
comment on column layer_style_custom.lsc_dmod is 'Last modification date';
comment on column layer_style_custom.lsc_ddel is 'Deletion date';