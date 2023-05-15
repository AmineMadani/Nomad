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
-- User appication
-- This table defines the application users.

create table users
(
  id                serial primary key,
  usr_first_name    text not null,
  usr_last_name	    text not null,
  usr_email	        text unique not null,
  usr_valid         boolean default True,
  usr_ucre_id       bigint default 0,
  usr_umod_id       bigint default 0,
  usr_dcre          timestamp without time zone  default current_timestamp,
  usr_dmod          timestamp without time zone  default current_timestamp
);

/* Comments on table */
COMMENT ON TABLE users IS 'This table defines the application users.';
/* Comments on fields */
COMMENT ON COLUMN users.id IS 'Table unique ID';
COMMENT ON COLUMN users.usr_first_name IS 'First name';
COMMENT ON COLUMN users.usr_last_name IS 'Last name';
COMMENT ON COLUMN users.usr_email IS 'User email';
COMMENT ON COLUMN users.usr_valid IS 'User valid';
COMMENT ON COLUMN users.usr_ucre_id IS 'User first name';
COMMENT ON COLUMN users.usr_umod_id IS 'User last name';
COMMENT ON COLUMN users.usr_dcre IS 'Creation date';
COMMENT ON COLUMN users.usr_dmod IS 'Modification date';

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
	dom_short                    text,
	dom_alias                    text,
	dom_ucre_id                  integer references users(id) default 0,
  dom_umod_id                  integer references users(id) default 0,
  dom_dcre                     timestamp without time zone  default current_timestamp,
  dom_dmod                     timestamp without time zone  default current_timestamp
);

/* Comments on table */
COMMENT ON TABLE domains IS 'This table lists up all the application domains: drinking water, sewage water...';
/* Comments on fields */
COMMENT ON COLUMN domains.id IS 'Table unique ID';
COMMENT ON COLUMN domains.dom_type IS 'Type of the domain, used to prefix domain related objects';
COMMENT ON COLUMN domains.dom_alias IS 'Alias of the domain';
COMMENT ON COLUMN domains.dom_short IS 'Short alias of the domain';



-- Layer tree
-- This table defines the layer tree exposed in the application.
-- Each layer belongs to a group

create table tree
(
  id                bigserial primary key,
  dom_id            bigint references domains(id),
  tre_parent_id     bigint references tree(id),
  tre_num_order     integer,
  tre_llabel        text,
  tre_slabel        text,
  tre_ucre_id       bigint references users(id) default 0,
  tre_umod_id       bigint references users(id) default 0,
  tre_dcre          timestamp without time zone  default current_timestamp,
  tre_dmod          timestamp without time zone  default current_timestamp
);

/* Comments on table */
COMMENT ON TABLE tree IS 'This table defines all groups and sub-groups to generate the app layer tree';
/* Comments on fields */
/*
COMMENT ON COLUMN tree.id IS 'Table unique ID';
COMMENT ON COLUMN tree.dom_id IS 'Application domain (ie: drinking water, ...)';
COMMENT ON COLUMN tree.tre_parent_id IS 'Parent id';
COMMENT ON COLUMN tree.tre_slabel IS 'Alias of the tree group';
*/

-- Value Lists
-- List of topological famility
-- gives topological behabiour for business object

create table vl_topology_type
(
    id bigserial primary key,
    tpt_type text unique not null,
    tpt_required_fields text[],
	  tpt_valid         boolean default True,
	  tpt_ucre_id       bigint references users(id) default 0,
    tpt_umod_id       bigint references users(id) default 0,
    tpt_dcre          timestamp without time zone  default current_timestamp,
    tpt_dmod          timestamp without time zone  default current_timestamp
);



insert into vl_topology_type(tpt_type, tpt_required_fields)
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
    id bigserial primary key,
	dom_id bigint references domains(id),
	ast_code text unique not null, -- code hérité de CANOPE / PICRU (20, 21...)
	ast_slabel text,
	ast_llabel text,
    ast_valid         boolean default True,
    ast_ucre_id       bigint references users(id) default 0,
    ast_umod_id       bigint references users(id) default 0,
    ast_dcre          timestamp without time zone  default current_timestamp,
    ast_dmod          timestamp without time zone  default current_timestamp
);


/* Comments on table */
COMMENT ON TABLE asset_type IS 'This table defines all the different types of asset';
/* Comments on fields */
COMMENT ON COLUMN asset_type.id IS 'Table unique ID';
COMMENT ON COLUMN asset_type.dom_id IS 'Domain type';
COMMENT ON COLUMN asset_type.ast_code IS 'Code asset';
COMMENT ON COLUMN asset_type.ast_slabel IS 'Alias asset type';


-- Layer
-- This table defines all the layers available in the app.

create table layer
(
    id bigserial primary key,
    lyr_num_order integer,
    dom_id bigint references domains(id),
    ast_id bigint references asset_type(id) ,-- code hérité de CANOPE / PICRU (20, 21...)
    tre_group_id bigint references tree(id),
    tre_simplified_group_id  bigint references tree(id),
    lyr_table_name regclass unique not null,
    --lyr_schema_name text not null,
    lyr_geom_column_name text not null,
    lyr_uuid_column_name text not null,
    lyr_geom_srid text not null,
    lyr_style text,
    lyr_slabel text,
	  lyr_llabel text,
	  lyr_valid         boolean default True,
    lyr_display       boolean default True,
	  lyr_ucre_id       bigint references users(id) default 0,
    lyr_umod_id       bigint references users(id) default 0,
    lyr_dcre          timestamp without time zone  default current_timestamp,
    lyr_dmod          timestamp without time zone  default current_timestamp
);

/* Comments on table */
COMMENT ON TABLE layer IS 'This table defines all the layers available in the app';
/* Comments on fields
COMMENT ON COLUMN layer.id IS 'Table unique ID';
COMMENT ON COLUMN layer.tre_group_id IS 'Tree group';
COMMENT ON COLUMN layer.tre_simplified_group_id IS 'Simplified grpoup ID';
COMMENT ON COLUMN layer.lyr_table_name IS 'Table that contains the layer features';
COMMENT ON COLUMN layer.lyr_schema_name IS 'Schema where the table is stored';
COMMENT ON COLUMN layer.geom_column_name IS 'Column name that contains features geometry';
COMMENT ON COLUMN layer.uuid_column_name IS 'Column name that contains unique ID';
COMMENT ON COLUMN layer.geom_srid IS 'SRID of the features geometry';
COMMENT ON COLUMN layer.style IS 'Mapbox json style';
COMMENT ON COLUMN layer.alias IS 'French alias of the layer';
*/

-- Basemaps
-- This table defines all the basemaps available in the app.

create table basemaps
(
  id bigserial primary key,
  map_alias text,
  map_type  text,
  map_url text,
  map_layer text,
  map_matrixset text,
  map_format text,
  map_projection text,
  map_tilegrid text,
  map_style text,
  map_attributions text,
  map_default boolean default false,
  map_display boolean default false,
  map_thumbnail bytea,
  map_valid         boolean default True,
  map_ucre_id       bigint references users(id) default 0,
  map_umod_id       bigint references users(id) default 0,
  map_dcre          timestamp without time zone  default current_timestamp,
  map_dmod          timestamp without time zone  default current_timestamp
);

/* Comments on table */
COMMENT ON TABLE basemaps IS 'This table defines all the raster layers available in the app';
/* Comments on fields
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
 */


-- Create table to store a grid that covers all asset
-- Used to export GeoJson
drop table if exists app_grid;
create table app_grid
(
  id bigserial primary key,
  geom geometry('Polygon', 3857),
  map_ucre_id       bigint references users(id) default 0,
  map_umod_id       bigint references users(id) default 0,
  map_dcre          timestamp without time zone  default current_timestamp,
  map_dmod          timestamp without time zone  default current_timestamp
);

/* Comments on table */
COMMENT ON TABLE app_grid IS 'This table defines the grid to export geojson';
/* Comments on fields
COMMENT ON COLUMN app_grid.geom IS 'Geometry of the grid';
COMMENT ON COLUMN app_grid.created_date IS 'Created date';
COMMENT ON COLUMN app_grid.last_edited_date IS 'Last edited date';
 */

-- Create table layer_references to store the corresponding columns for each layers
CREATE TABLE layer_references(
    id bigserial PRIMARY KEY,
    lyr_id bigint NOT NULL REFERENCES layer(id),
    lrf_reference_key text NOT NULL,
    lrf_alias text,
    lrf_ucre_id       bigint references users(id) default 0,
    lrf_umod_id       bigint references users(id) default 0,
    lrf_dcre          timestamp without time zone  default current_timestamp,
    lrf_dmod          timestamp without time zone  default current_timestamp
);
/* Comments on table */
COMMENT ON TABLE layer_references IS 'This table defines the corresponding columns (reference_key) for each layers';
/* Comments on fields
COMMENT ON COLUMN layer_references.id IS 'Table unique ID';
COMMENT ON COLUMN layer_references.lyr_table_name IS 'Postgres Table';
COMMENT ON COLUMN layer_references.reference_key IS 'Reference key. It is the column name in the layer table';
COMMENT ON COLUMN layer_references.alias IS 'Alias to display in the app';
COMMENT ON COLUMN layer_references.created_date IS 'Created date';
COMMENT ON COLUMN layer_references.last_edited_date IS 'Last edited date';
 */


CREATE TYPE layer_references_display_type AS ENUM ('SYNTHETIC','DETAILED');

-- Create table layer_references_default to store the default display_type and position for each layer_references
CREATE TABLE layer_references_default(
    id bigserial PRIMARY KEY,
    lrd_id           bigint  NOT NULL REFERENCES layer_references (id),
    lrd_position     INT NOT NULL,
    lrd_section      text,
    lrd_isvisible     boolean default true,
    lrd_display_type  layer_references_display_type NOT NULL,
    lrd_ucre_id       bigint references users(id) default 0,
    lrd_umod_id       bigint references users(id) default 0,
    lrd_dcre          timestamp without time zone  default current_timestamp,
    lrd_dmod          timestamp without time zone  default current_timestamp
);
/* Comments on table */
COMMENT ON TABLE layer_references_default IS 'This table defines the default display_type and position for each layer_references in the app';
/* Comments on fields
COMMENT ON COLUMN layer_references_default.id IS 'Table unique ID';
COMMENT ON COLUMN layer_references_default.layer_reference_id IS 'Layer reference ID';
COMMENT ON COLUMN layer_references_default.position IS 'Position in the app';
COMMENT ON COLUMN layer_references_default.display_type IS 'Display type (SYNTHETIC or DETAILED)';
COMMENT ON COLUMN layer_references_default.section IS 'Section to group properties';
COMMENT ON COLUMN layer_references_default.isvisible IS 'If visible, true else false';
COMMENT ON COLUMN layer_references_default.created_date IS 'Created date';
COMMENT ON COLUMN layer_references_default.last_edited_date IS 'Last edited date';
*/

-- Create table layer_references_user to store the user display_type and position for each layer_references
CREATE TABLE layer_references_user(
    id bigserial     PRIMARY KEY NOT NULL,
    lrf_id           bigint NOT NULL REFERENCES layer_references (id),
    lru_user_id      bigint NOT NULL REFERENCES users(id),
    lru_position     INT NOT NULL,
    lru_display_type layer_references_display_type NOT NULL,
    lru_section      text,
    lru_isvisible    boolean default true,
    lru_ucre_id       bigint references users(id) default 0,
    lru_umod_id       bigint references users(id) default 0,
    lru_dcre          timestamp without time zone  default current_timestamp,
    lru_dmod          timestamp without time zone  default current_timestamp
);
/* Comments on table */
COMMENT ON TABLE layer_references_user IS 'This table defines the user display_type and position for each layer_references in the app';
/* Comments on fields
COMMENT ON COLUMN layer_references_user.id IS 'Table unique ID';
COMMENT ON COLUMN layer_references_user.layer_reference_id IS 'Layer reference ID';
COMMENT ON COLUMN layer_references_user.user_id IS 'User ID';
COMMENT ON COLUMN layer_references_user.position IS 'Position in the app';
COMMENT ON COLUMN layer_references_user.display_type IS 'Display type (SYNTHETIC or DETAILED)';
COMMENT ON COLUMN layer_references_user.isvisible IS 'If visible, true else false';
COMMENT ON COLUMN layer_references_user.section IS 'Section to group properties';
COMMENT ON COLUMN layer_references_user.created_date IS 'Created date';
COMMENT ON COLUMN layer_references_user.last_edited_date IS 'Last edited date';
*/


create table if not exists  contract_activity(
  id                           bigserial primary key,
  cta_code                     text unique not null,
  cta_slabel	        	       text,
  cta_llabel	        	       text,
  cta_valid                    boolean default true,
  cta_ucre_id                      bigint references users(id) default 0,
  cta_umod_id                      bigint references users(id) default 0,
  cta_dcre                     timestamp without time zone  default current_timestamp,
  cta_dmod                     timestamp without time zone  default current_timestamp
);


--FIXME manque la notion d'exploitant / de DICT / DSP ou Hors DSP / statut . Type client
--FIXME manque la notion de territoire
create table if not exists contract(
  id                           bigserial primary key,
  ctr_code                     text unique,
  ctr_slabel	        	       text,
  ctr_llabel	        	       text,
  ctr_valid                    boolean default True,
  ctr_start_date               timestamp without time zone,
  ctr_end_date                 timestamp without time zone,
  ctr_ucre_id                  bigint references users(id) default 0,
  ctr_umod_id                  bigint references users(id) default 0,
  ctr_dcre                     timestamp without time zone  default current_timestamp,
  ctr_dmod                     timestamp without time zone  default current_timestamp,
  cta_id                       bigint references contract_activity(id),
  geom                         geometry('MULTIPOLYGON', 3857)
);

create index on contract using gist(geom);

--FIXME manque la notion de territoire
create table if not exists city(
  id                           bigserial primary key,
  cty_code                     text unique,
  cty_slabel	        	   text,
  cty_llabel	        	   text,
  cty_ucre_id                  bigint references users(id) default 0,
  cty_umod_id                  bigint references users(id) default 0,
  cty_dcre                     timestamp without time zone  default current_timestamp,
  cty_dmod                     timestamp without time zone  default current_timestamp,
  geom                         geometry('MULTIPOLYGON', 3857)
);

create index on city using gist(geom);

create table if not exists workorder_task_status
(
  id                           bigserial primary key,
  wts_code                     text unique not null,
  wts_slabel	        	   text not null,
  wts_llabel	        	   text,
  wts_wo     	  	           boolean default True,
  wts_task     	  	           boolean default True,
  wts_valid                    boolean default True,
  wts_ucre_id                  bigint references users(id) default 0,
  wts_umod_id                  bigint references users(id) default 0,
  wts_dcre                     timestamp without time zone  default current_timestamp,
  wts_dmod                     timestamp without time zone  default current_timestamp
);

create table if not exists workorder_task_reason
(
  id                           bigserial primary key,
  wtr_code                     text unique not null,
  wtr_slabel	        	   text not null,
  wtr_llabel	        	   text,
  wtr_valid                    boolean default True,
  wtr_work_request             boolean default True,
  wtr_report                   boolean default True,
  wtr_wo     	  	           boolean default True,
  wtr_task     	  	           boolean default True,
  wtr_ucre_id                  bigint references users(id) default 0,
  wtr_umod_id                  bigint references users(id) default 0,
  wtr_dcre                     timestamp without time zone  default current_timestamp,
  wtr_dmod                     timestamp without time zone  default current_timestamp
);

create table if not exists ast_wtr
(
  wtr_id                       bigint not null references workorder_task_reason(id),
  ast_id	        	       bigint not null references asset_type(id),
  ---
  asw_ucre_id                   bigint references users(id),
  asw_umod_id                   bigint references users(id),
  asw_dcre                     timestamp without time zone  default current_timestamp,
  asw_dmod                     timestamp without time zone  default current_timestamp,
  primary key (wtr_id, ast_id)
);



create table if not exists street(
id                           bigserial primary key,
str_code                     text,
str_slabel	        	     text,
str_llabel	        	     text,
str_source	        	     text,
str_valid                    boolean default True,
geom                         geometry,
str_ucre_id                  bigint references users(id) default 0,
str_umod_id                  bigint references users(id) default 0,
str_dcre                     timestamp without time zone  default current_timestamp,
str_dmod                     timestamp without time zone  default current_timestamp
);




create table if not exists asset(
id                           bigserial primary key,
ass_obj_ref                  text,
ass_obj_table                regclass NOT NULL REFERENCES layer(lyr_table_name),
ass_valid                    boolean default True,
ass_ucre_id                  bigint references users(id) default 0,
ass_umod_id                  bigint references users(id) default 0,
ass_dcre                     timestamp without time zone  default current_timestamp,
ass_dmod                     timestamp without time zone  default current_timestamp
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
  wko_ucre_id                  bigint references users(id) default 0,
  wko_umod_id                  bigint references users(id) default 0,
  wko_dmod                     timestamp without time zone  default current_timestamp,
  wko_dcre        	           timestamp without time zone  default current_timestamp,
  ------
  cty_id                       bigint references city(id),
  cty_llabel                   text,
  ------
  ass_id		               bigint not null references asset(id),
  ------
  wts_id                       bigint references workorder_task_status(id), -- status
  wtr_id                       bigint references workorder_task_reason(id), -- reason
  ------
  str_id                       bigint references street(id),
  str_llabel                   text,
  ------
  ctr_id                       bigint references contract(id),

  wko_ddel                     timestamp without time zone default null,
  ------
  /*
  water_stop_id                bigint,
  program_id                   bigint,
  worksite_id                  bigint, -- FIXME: territoirre ? pourquoi le mettre dans les workorder ?
  delivery_point_id            bigint,
  */
  ------
  longitude                    numeric,
  latitude                     numeric,
  geom                         geometry('POINT', 3857)
);

create table if not exists task
(
  id                           bigserial primary key,
  wko_id		               bigint references workorder(id),
  tsk_name                     text,
  wts_id                       bigint references workorder_task_status(id), -- status
  wtr_id                       bigint references workorder_task_reason(id), -- reason
  tsk_comment                  text,
  ctr_id                       bigint references contract(id),
  ass_id                       bigint references  asset(id), -- FIXME uuid ou ID Vigie préfixé
  tsk_planning_start_date	   timestamp without time zone,
  tsk_planning_end_date	       timestamp without time zone,
  tsk_completion_date	       timestamp without time zone,
  tsk_realization_user         bigint,
  tsk_ucre_id                   integer references users(id) default 0,
  tsk_umod_id                   integer references users(id) default 0,
  tsk_dcre        	           timestamp without time zone  default current_timestamp,
  tsk_dmod                     timestamp without time zone  default current_timestamp,
  tsk_ddel                     timestamp without time zone default null,
  --------
  longitude                    numeric,
  latitude                     numeric,
  geom                         geometry('POINT', 3857)
);



create table if not exists report(
  id                           bigserial primary key,
  tsk_id                       bigint references task(id) ,
  rpt_report_date              timestamp without time zone  default current_timestamp,
  rpt_ucre_id                   bigint references users(id) default 0,
  rpt_umod_id                   bigint references users(id) default 0,
  rpt_dcre                     timestamp without time zone  default current_timestamp,
  rpt_dmod                     timestamp without time zone  default current_timestamp,
  rpt_ddel                     timestamp without time zone default null,
  rpt_detail                   jsonb
);


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
