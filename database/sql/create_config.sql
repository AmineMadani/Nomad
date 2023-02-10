/****************************************************
 * Scripts to Create config objects in the database *
 ****************************************************/

set search_path to config, public;

create table float_setting (
    name text primary key
  , value double precision
);

create table text_setting (
    name text primary key
  , value text
);

--
-- Get the current value of the given float setting name.
-- By default, it looks for the parameter in the float_settings table.
-- But the setting can be overriden by a SET command in the current session.
create or replace function current_float(setting text) returns double precision
language plpgsql
immutable -- immutable is required to get good plans
as
$$
begin
  return current_setting(setting);
exception when others then
  return (select value from config.float_setting where name=setting);
end;
$$;

--
-- Get the current value of the given text setting name.
-- By default, it looks for the parameter in the text_settings table.
-- But the setting can be overriden by a SET command in the current session.
create or replace function current_text(setting text) returns text
language plpgsql
immutable -- immutable is required to get good plans
as
$$
begin
  return (select value from config.text_setting where name=setting);
end;
$$;

--
-- Get the current version of product
create or replace function get_product_version() returns text
language plpgsql
immutable -- immutable is required to get good plans
as
$$
begin
  return (select config.current_text('product.version'));
end;
$$;


--
-- Get the current srid
create or replace function get_srid() returns integer
language plpgsql
immutable -- immutable is required to get good plans
as
$$
begin
  return (select config.current_text('srid')::integer);
end;
$$;
--
-- Set the current version of product
create or replace function set_product_version(version text) returns void
language plpgsql
as
$$
begin
  insert into config.text_setting values ('product.version', version)
         ON CONFLICT (name) DO UPDATE SET value=version;
end;
$$;

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

-- Business objects
-- This table lists up the business objects.
-- A business object in the model can be linked to work order

create table business_object
(
    id serial primary key
  , domain_type text not null references config.domain(type)
  , topology_type text references  config.vl_topology_type(type)
  , type text unique not null
);

/* Comments on table */
COMMENT ON TABLE business_object IS 'This table defines all business objects in the Application';
/* Comments on fields */
COMMENT ON COLUMN business_object.id IS 'Table unique ID';
COMMENT ON COLUMN business_object.domain_type IS 'Application domain (ie: drinking water, ...)';
COMMENT ON COLUMN business_object.type IS 'Object type';

create unique index business_object_type_idx on business_object(domain_type, type);


-- Layer
-- This table defines all the layers available in the app.

create table layer
(
    id serial primary key
  , num_order integer
  , domain_type text references domain(type)
  , business_object_type text references business_object(type)
  , tree_group_id integer references tree(id)
  , simplified_tree_group_id  integer references tree(id)
  , pg_table regclass --FIXME not null
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
COMMENT ON COLUMN layer.pg_table IS 'PG table that contains the layer features';
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

-- Create view to generate simplified layer tree
-- Use config table that gives for each domain
-- the associated tabs and its layers
create or replace view v_simplified_layer_tree as
with recursive domains as
 (
 SELECT type as parent_domain_type, alias as parent_domain_alias, type as domain_type, alias as tab
   FROM config.domain
  where parent_type is null
  union all
 select d1.parent_type as parent_domain_type, d2.parent_domain_alias, d1.type as domain_type, d1.alias as tab
   from domains d2
   join config.domain d1
     on d1.parent_type = d2.domain_type
)
   select d.parent_domain_type, d.parent_domain_alias, d.tab, t.alias as tree_group,l.*
     from config.layer l
left join domains d on d.domain_type = l.domain_type
left join config.tree t on t.id = l.simplified_tree_group_id
 order by l.num_order;

-- Create view to generate detailed layer tree
-- Use config table that gives for each domain
-- the associated layers group by group
create or replace view v_detailed_layer_tree as
with
toc as
(
with recursive tree_orga as
  (
  SELECT id,  id  as parent, domain_type, num_order as num_order , alias as parent_tree_group , alias as tree_group
   FROM config.tree
  where parent_id is null
  union all
  select lg.id, parent, lg.domain_type, lg.num_order, parent_tree_group, lg.alias as tree_group
   from tree_orga g
   join config.tree lg
     on lg.parent_id = g.id
  )
  select * from tree_orga
),
domains as
(
  with recursive domains as
  (
  SELECT type as parent_domain_type, alias as parent_domain_alias, type as domain_type, alias as tab
   FROM config.domain
  where parent_type is null
  union all
  select d1.parent_type as parent_domain_type, d2.parent_domain_alias, d1.type as domain_type, d1.alias as tab
   from domains d2
   join config.domain d1
     on d1.parent_type = d2.domain_type
  )
  select * from domains
)
    select d.parent_domain_type, d.parent_domain_alias,  t.parent_tree_group, t.tree_group, l.*
      from config.layer l
 left join domains d on d.domain_type = l.domain_type
 left join toc t on t.id = l.tree_group_id
  order by l.num_order;
