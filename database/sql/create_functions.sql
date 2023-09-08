\encoding UTF8

set search_path to nomad, public;

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
  return (select value from nomad.float_setting where name=setting);
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
  return (select value from nomad.text_setting where name=setting);
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
  return (select nomad.current_text('product.version'));
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
  return (select nomad.current_text('srid')::integer);
end;
$$;

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

-- Function to transform underscore formatted strings to camelCase
CREATE OR REPLACE FUNCTION underscore_to_camelcase(input_text text) RETURNS text AS $$
DECLARE
    parts text[];
    result text;
    i integer;
BEGIN
    parts := string_to_array(input_text, '_');
    result := parts[1];

    FOR i IN 2..array_length(parts, 1)
        LOOP
            result := result || initcap(parts[i]);
        END LOOP;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to create a geojson collection
-- if specify list of fields, must add ID and GEOM fields
create or replace function f_get_geojson_from_tile(lyr_table_name text, tile_id integer, user_ident int = NULL)
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
  if lyr_table_name != 'task' then
  	select CONCAT(string_agg('t.'||"referenceKey", ', '), ', ' || (SELECT 'cty.id as cty_id'
	  FROM information_schema.columns 
	  WHERE table_schema||'.'||table_name='asset.'||lyr_table_name and column_name='insee_code'), ', ' || (SELECT 'ctr.id as ctr_id' 
	  FROM information_schema.columns 
	  WHERE table_schema||'.'||table_name='asset.'||lyr_table_name and column_name='code_contrat')) into list_fields
      from nomad.f_get_layer_references_user(0, false) f
      where layer = lyr_table_name and ("displayType" = 'SYNTHETIC' or "isVisible" = false);
  end if;
  --
  if list_fields is null then
    -- Get list of fields from postgres
    select string_agg(column_name, ', ')  into list_fields
      from information_schema.columns
     where table_schema||'.'||table_name = 'asset.'||lyr_table_name;
  end if;
  --
  execute format($sql$
  with
  records as
  (select %1$s, ST_X(ST_Centroid(t.geom)) as x, ST_Y(ST_Centroid(t.geom)) as y from %2$s t join nomad.contract ctr on ctr.ctr_code =t.code_contrat join nomad.usr_ctr_prf ucp on ucp.ctr_id=ctr.id and ucp.usr_id = %5$s::int and ucp.usc_ddel is null left join nomad.city cty on cty.cty_code = t.insee_code where st_intersects(t.geom, '%3$s'::geometry)),
  features as
  (
    select 
        jsonb_build_object(
            'type', 'Feature',
            'id', id,
            'geometry', ST_AsGeoJSON(geom)::jsonb,
            -- Transform underscore to camelcase permit to use the same standards in all the app  
            'properties', jsonb_object_agg(nomad.underscore_to_camelcase(key), value)
        ) as feature
    from records r
    JOIN LATERAL jsonb_each(to_jsonb(r.*) - 'geom') ON TRUE
    GROUP BY id, r.geom, x, y
  )
  SELECT jsonb_build_object(
  'crs', '%4$s'::jsonb,
  'name',  '%2$s',
  'type',     'FeatureCollection',
  'features', jsonb_agg(feature))
  from features f
  $sql$, coalesce(list_fields, '*'), ('asset.'||lyr_table_name)::text, tile_geom::text, crs, user_ident) into geojson;
  return geojson;
exception when others then
	raise notice 'ERROR : % - % ',SQLERRM, SQLSTATE;
  return null;
end;
$$;

-- Function to create a geojson index
-- for a specific layer
create or replace function f_get_geojson_index(lyr_table_name text)
returns jsonb
language plpgsql
as $$
declare
	geojson jsonb;
	tile_geom geometry;
begin
  with
  records as
  (select split_part(lyr_table_name, '.', 1)||'_'||id||'.geojson' as file, st_asText(st_extent(geom))::text as bbox, geom from nomad.app_grid group by id, geom order by id),
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
  'name',     lyr_table_name||'_index',
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
CREATE OR REPLACE FUNCTION f_get_layer_references_user(searched_user_id BIGINT = NULL, camelCase boolean = true)
    RETURNS TABLE(
         layer text,
         "referenceId" BIGINT,
         "referenceKey" text,
         alias TEXT,
         "position" INT,
         "displayType" text,
         "isVisible" boolean,
         section text
     ) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT lyr_table_name::text as _layer,
           r.id as _id,
           -- Transform underscore to camelcase permit to use the same standards in all the app  
           CASE WHEN camelCase 
              THEN nomad.underscore_to_camelcase(r.lrf_reference_key) 
              ELSE r.lrf_reference_key 
           END as _referenceKey,
           r.lrf_llabel as _alias,
           --- if specific conf for user, get the conf
           COALESCE(u.lru_position, d.lrd_position) AS _position,
           COALESCE(u.lru_display_type, d.lrd_display_type)::text as _displayType,
           COALESCE(u.lru_isvisible, d.lrd_isvisible) as _isVisible,
           COALESCE(u.lru_section, d.lrd_section)::text as _section
      FROM nomad.layer_references r
      join nomad.layer l on l.id = r.lyr_id
      JOIN nomad.layer_references_default d ON r.id = d.lrd_id
 LEFT JOIN nomad.layer_references_user u ON r.id = u.lrf_id AND u.lru_user_id = searched_user_id
  ORDER BY 1, 5;
END;
$$;
