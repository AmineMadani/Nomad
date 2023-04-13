set search_path to config, public;

-- Function to create a grid
-- used to produce geojson on a specified extent

CREATE OR REPLACE FUNCTION ST_CreateFishnet(
        nrow integer, ncol integer,
        xsize float8, ysize float8,
        x0 float8 DEFAULT 0, y0 float8 DEFAULT 0,
        OUT "row" integer, OUT col integer,
        OUT geom geometry)
    RETURNS SETOF record AS
$$
SELECT i + 1 AS row, j + 1 AS col, ST_Translate(cell, j * $3 + $5, i * $4 + $6) AS geom
FROM generate_series(0, $1 - 1) AS i,
     generate_series(0, $2 - 1) AS j,
(
SELECT ('POLYGON((0 0, 0 '||$4||', '||$3||' '||$4||', '||$3||' 0,0 0))')::geometry AS cell
) AS foo;
$$ LANGUAGE sql IMMUTABLE STRICT;

-- Function to create a geojson collection
-- if specify list of fields, must add ID and GEOM fields
create or replace function get_geojson_from_tile(layer_name text, tile_id integer, user_ident int = NULL)
returns jsonb
language plpgsql
as $$
declare
	geojson jsonb;
	tile_geom geometry;
  list_fields text;
begin
  tile_geom := (select geom from config.app_grid where id = tile_id);
  -- Get list of fields from conf
  select string_agg(reference_key, ', ')  into list_fields
    from config.get_layer_references_user(user_ident)
   where layer = layer_name;
  --
  raise notice 'list_fields: %', list_fields;
  execute format($sql$
  with
  records as
  (select %1$s from %2$s t where st_intersects(t.geom, '%3$s'::geometry)),
  features as
  (
	select jsonb_build_object(
	'type',       'Feature',
	'id',         id,
	'geometry',   ST_AsGeoJSON(geom)::jsonb,
  'properties', to_jsonb(r.*) - 'id' - 'geom') as feature
  from records r
  )
  SELECT jsonb_build_object(
  'type',     'FeatureCollection',
  'features', jsonb_agg(feature))
  from features f
  $sql$, coalesce(list_fields, '*'), layer_name, tile_geom::text) into geojson;
  return geojson;
exception when others then
	raise notice 'ERROR : % - % ',SQLERRM, SQLSTATE;
  return null;
end;
$$;

-- Function to create a geojson index
-- for a specific layer
create or replace function get_geojson_index(layer text)
returns jsonb
language plpgsql
as $$
declare
	geojson jsonb;
	tile_geom geometry;
begin
  with
  records as
  (select layer||'_'||id||'.geojson' as file, st_asText(st_extent(geom))::text as bbox, geom from config.app_grid group by id, geom order by id),
  features as
  (
	select jsonb_build_object(
	'type',       'Feature',
	'geometry',   NULL,
  'properties', to_jsonb(r.*) - 'geom') as feature
  from records r
  )
  SELECT jsonb_build_object(
  'type',     'FeatureCollection',
  'name',     layer||'_index',
  'features', jsonb_agg(feature))
  from features f
  into geojson;
  return geojson;
exception when others then
	raise notice 'ERROR : % - % ',SQLERRM, SQLSTATE;
  return null;
end;
$$;

-- Function to get the list of layers of a user
CREATE OR REPLACE FUNCTION get_layer_references_user(searched_user_id INTEGER)
    RETURNS TABLE(
         layer text,
         reference_id INT,
         reference_key text,
         alias TEXT,
         "position" INT,
         display_type text,
         isvisible boolean,
         section text
     ) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT pg_table::text as _layer,
           r.id as _id,
           r.reference_key as _reference_key,
           r.alias as _alias,
           --- if specific conf for user, get the conf
           COALESCE(u.position, d.position) AS _position,
           COALESCE(u.display_type, d.display_type)::text as _displayType,
           COALESCE(u.isvisible, d.isvisible) as _isvisible,
           COALESCE(u.section, d.section)::text as _section
      FROM config.layer_references r
      JOIN config.layer_references_default d ON r.id = d.layer_reference_id
 LEFT JOIN config.layer_references_user u ON r.id = u.layer_reference_id AND u.user_id = NULL
  ORDER BY 1, 5;
END;
$$;

-- Function to get the default list of layers
-- FIXME doit on la garder sachant que la fonction ci dessus ressort a conf par défaut si user = NULL
CREATE OR REPLACE FUNCTION get_layer_references_default()
    RETURNS TABLE(
         layer_key VARCHAR,
         reference_id INT,
         reference_key VARCHAR,
         alias TEXT,
         "position" INT,
         display_type VARCHAR
     ) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
        SELECT
            cast(substring(cast(layer.pg_table as varchar), position('.' IN cast(layer.pg_table as varchar)) + 1) as varchar) as layerKey,
            reference.id,
            reference.reference_key,
            reference.alias,
            default_reference.position AS position,
            cast(default_reference.display_type as varchar) as displayType
        FROM config.layer_references reference
                 INNER JOIN config.layer ON reference.layer_id = layer.id
                 INNER JOIN config.layer_references_default default_reference ON reference.id = default_reference.layer_reference_id
        ORDER BY layer.id;
END;
$$;
