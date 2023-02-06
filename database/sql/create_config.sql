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
  , short text
  , alias text
);

/* Comments on table */
COMMENT ON TABLE application_domain IS 'This table lists up all the application domains: drinking water, sewage water...';
/* Comments on fields */
COMMENT ON COLUMN application_domain.id IS 'Table unique ID';
COMMENT ON COLUMN application_domain.type IS 'Type of the domain, used to prefix domain related objects';
COMMENT ON COLUMN application_domain.alias IS 'Alias of the domain';
COMMENT ON COLUMN application_domain.short IS 'Short alias of the domain';


create unique index on application_domain using btree(type);


-- Layer groups
-- This table defines the layer tree.
-- Each layer belongs to a group

create table layer_tree
(
    id serial primary key
  , parent_group int references layer_tree(id)
  , alias text
);

/* Comments on table */
COMMENT ON TABLE layer_tree IS 'This table defines all groups and sub-groups to generate the app layer tree';
/* Comments on fields */
COMMENT ON COLUMN layer_tree.id IS 'Table unique ID';
COMMENT ON COLUMN layer_tree.alias IS 'Alias of the group';


-- Layer
-- This table defines all the layers available in the app.

create table layer
(
    id serial primary key
  , name text not null
  , parent_group int references layer_tree(id)
  , application_domain_type text references application_domain(type)
  , pg_table regclass not null
  , geom_column_name text not null
  , geom_srid text not null
  , style text
  , alias text
);

/* Comments on table */
COMMENT ON TABLE layer IS 'This table defines all the layers available in the app';
/* Comments on fields */
COMMENT ON COLUMN layer.id IS 'Table unique ID';
COMMENT ON COLUMN layer.name IS 'Layer name';
COMMENT ON COLUMN layer.parent_group IS 'Group ID';
COMMENT ON COLUMN layer.application_domain_type IS 'Type of domain';
COMMENT ON COLUMN layer.pg_table IS 'PG table that contains the layer features';
COMMENT ON COLUMN layer.geom_column_name IS 'Column name that contains features geometry';
COMMENT ON COLUMN layer.geom_srid IS 'SRID of the features geometry';
COMMENT ON COLUMN layer.style IS 'Mapbox style';
COMMENT ON COLUMN layer.alias IS 'French alias of the layer';

create unique index layer_name_domain_idx on layer(name, application_domain_type);

/* view thats gives fro all layer the root group */
create or replace view layer_parent as
with recursive groups as
 (
 SELECT id,  id  as parent
   FROM config.layer_tree
  where parent_group is null
 union all
 select lg.id, parent
   from groups g
   join config.layer_tree lg
     on lg.parent_group = g.id
 )
 select g.parent as parent_group_id
        , l.*
   from config.layer l
   join config.layer_tree pg on pg.id = l.parent_group
   join groups g on g.id =pg.id
 order by pg.id, g.id;


-- Raster Layer
-- This table defines all the raster layers available in the app (wms, wmts..).

create table raster_layer
(
  id serial primary key
  , alias text
  , source text
  , provider text
  , visible boolean default true
);

/* Comments on table */
COMMENT ON TABLE raster_layer IS 'This table defines all the raster layers available in the app';
/* Comments on fields */
COMMENT ON COLUMN raster_layer.id IS 'Table unique ID';
COMMENT ON COLUMN raster_layer.source IS 'Source of the web service';
COMMENT ON COLUMN raster_layer.provider IS 'Provider of the web service';
COMMENT ON COLUMN raster_layer.visible IS 'Visible by default';
COMMENT ON COLUMN raster_layer.alias IS 'Alias of the layer';
