set search_path to nomad, public;

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
  crs jsonb;
begin
  tile_geom := (select geom from nomad.app_grid where id = tile_id);
  --
  crs := jsonb_build_object('name', 'urn:ogc:def:crs:EPSG::'||nomad.get_srid());
  crs :=  jsonb_build_object('type', 'name', 'properties', crs);
  --
  -- Get list of fields from conf
  select string_agg("referenceKey", ', ')  into list_fields
    from nomad.get_layer_references_user(user_ident)
   where layer = layer_name and ("displayType" is not null or "isVisible" = false);
  --
  if list_fields is null then
    -- Get list of fields from postgres
    select string_agg(column_name, ', ')  into list_fields
      from information_schema.columns
     where table_schema||'.'||table_name = layer_name;
  end if;
  --
  execute format($sql$
  with
  records as
  (select %1$s from asset.%2$s t where st_intersects(t.geom, '%3$s'::geometry)),
  features as
  (
	select jsonb_build_object(
	'type',       'Feature',
	'id',         id,
	'geometry',   ST_AsGeoJSON(geom)::jsonb,
  'properties', to_jsonb(r.*) - 'geom') as feature
  from records r
  )
  SELECT jsonb_build_object(
  'crs', '%4s'::jsonb,
  'name',  '%2$s',
  'type',     'FeatureCollection',
  'features', jsonb_agg(feature))
  from features f
  $sql$, coalesce(list_fields, '*'), layer_name, tile_geom::text, crs) into geojson;
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
  (select layer||'_'||id||'.geojson' as file, st_asText(st_extent(geom))::text as bbox, geom from nomad.app_grid group by id, geom order by id),
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
CREATE OR REPLACE FUNCTION get_layer_references_user(searched_user_id INTEGER = NULL)
    RETURNS TABLE(
         layer text,
         "referenceId" INT,
         "referenceKey" text,
         alias TEXT,
         "position" INT,
         "displayType" text,
         "isVisible" boolean,
         section text
     ) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT pg_table::text as _layer,
           r.id as _id,
           r.reference_key as _referenceKey,
           r.alias as _alias,
           --- if specific conf for user, get the conf
           COALESCE(u.position, d.position) AS _position,
           COALESCE(u.display_type, d.display_type)::text as _displayType,
           COALESCE(u.isvisible, d.isvisible) as _isVisible,
           COALESCE(u.section, d.section)::text as _section
      FROM nomad.layer_references r
      JOIN nomad.layer_references_default d ON r.id = d.layer_reference_id
 LEFT JOIN nomad.layer_references_user u ON r.id = u.layer_reference_id AND u.user_id = searched_user_id
  ORDER BY 1, 5;
END;
$$;
