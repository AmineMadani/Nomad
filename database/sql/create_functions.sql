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
create or replace function get_geojson_from_tile(layer text, tile_id integer, list_fields text = NULL)
returns jsonb
language plpgsql
as $$
declare
	geojson jsonb;
	tile_geom geometry;
begin
  tile_geom := (select geom from config.app_grid where id = tile_id);
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
  $sql$, coalesce(list_fields, '*'), layer, tile_geom::text) into geojson;
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
  (select layer||'_'||id||'.geojson' as file, st_extent(geom)::text as bbox, geom from config.app_grid group by id, geom order by id),
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
