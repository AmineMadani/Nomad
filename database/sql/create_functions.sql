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
create or replace function f_get_geojson_from_tile(lyr_table_name text, tile_id integer, start_date text DEFAULT NULL::text, user_ident integer DEFAULT NULL::integer)
    returns jsonb
    language plpgsql
as $$
declare
    geojson jsonb;
    tile_geom geometry;
    list_fields text;
    crs jsonb;
    sql_query text;
begin
    tile_geom := (select geom from nomad.app_grid where id = tile_id);
    --
    crs := jsonb_build_object('name', 'urn:ogc:def:crs:EPSG::'||nomad.get_srid());
    crs :=  jsonb_build_object('type', 'name', 'properties', crs);
    --
    -- Get list of fields from conf
    if lyr_table_name != 'task' then
        SELECT
            CONCAT(
                string_agg(''''||nomad.underscore_to_camelcase("referenceKey")||''''||', t.'||"referenceKey", ', '),
                ', ' ||
                (SELECT '''ctyId'', cty.id'
                FROM information_schema.columns
                WHERE table_schema||'.'||table_name='asset.'||lyr_table_name and column_name='insee_code'),
                ', ' ||
                (SELECT '''ctrId'', ctr.id'
                FROM information_schema.columns
                WHERE table_schema||'.'||table_name='asset.'||lyr_table_name and column_name='code_contrat')
            )
        INTO list_fields
        FROM nomad.f_get_layer_references_user(user_ident, false) f
        WHERE layer = lyr_table_name AND "displayType" = 'SYNTHETIC';
    end if;
    --
    if list_fields is null then
        -- Get list of fields from postgres
        SELECT
            STRING_AGG('''' || nomad.underscore_to_camelcase(column_name) || ''', t.' || column_name, ', ')
        INTO list_fields
        FROM information_schema.columns
        WHERE table_schema || '.' || table_name = 'asset.' || lyr_table_name;
    end if;
    --
    if lyr_table_name != 'task' then
        sql_query := FORMAT('
        WITH features AS (
            SELECT DISTINCT ON (t.id)
                jsonb_build_object(
                    ''type'', ''Feature'',
                    ''id'', t.id,
                    ''geometry'', ST_AsGeoJSON(t.geom)::jsonb,
                    ''properties'', jsonb_build_object(%1$s, ''x'', ST_X(ST_Centroid(t.geom)), ''y'', ST_Y(ST_Centroid(t.geom)))
                ) as feature
            FROM %2$s t
                INNER JOIN nomad.contract ctr ON ctr.ctr_code = t.code_contrat
                INNER JOIN nomad.usr_ctr_prf ucp ON ucp.ctr_id=ctr.id AND ucp.usr_id = %5$s AND ucp.usc_ddel IS NULL
                LEFT JOIN nomad.city cty ON cty.cty_code = t.insee_code
            WHERE st_intersects(t.geom, ''%3$s''::geometry)
        )
        SELECT
            jsonb_build_object(
                ''crs'', ''%4$s''::jsonb,
                ''name'', ''%2$s'',
                ''type'', ''FeatureCollection'',
                ''features'', jsonb_agg(feature)
            )
        FROM features;
    ', list_fields, ('asset.'||lyr_table_name)::text, tile_geom::text, crs, user_ident);
    else
    	if start_date is null then
    		start_date := '''1900-01-01''';
    	end if;
    
        sql_query := FORMAT('
        WITH features AS (
            SELECT DISTINCT ON (t.id)
                jsonb_build_object(
                        ''type'', ''Feature'',
                        ''id'', t.id,
                        ''geometry'', ST_AsGeoJSON(t.geom)::jsonb,
                        ''properties'', jsonb_build_object(%1$s, ''x'', ST_X(ST_Centroid(t.geom)), ''y'', ST_Y(ST_Centroid(t.geom)))
                    ) as feature
            FROM %2$s t
                INNER JOIN nomad.usr_ctr_prf ucp ON ucp.ctr_id=t.ctr_id AND ucp.usr_id = %5$s AND ucp.usc_ddel IS NULL
            WHERE st_intersects(t.geom, ''%3$s''::geometry)
				and 
				(
            		(t.wko_planning_end_date >=  %6$s or t.wko_completion_start_date >= %6$s)
						or
					(t.wko_planning_end_date is NULL and t.wko_completion_start_date is NULL)
				)
        )
        SELECT
            jsonb_build_object(
                    ''crs'', ''%4$s''::jsonb,
                    ''name'', ''%2$s'',
                    ''type'', ''FeatureCollection'',
                    ''features'', jsonb_agg(feature)
                )
        FROM features;
        ', list_fields, ('asset.'||lyr_table_name)::text, tile_geom::text, crs, user_ident,start_date);
    end if;

    execute sql_query into geojson;

    return geojson;
exception when others then
    raise notice 'ERROR : % - % ',SQLERRM, SQLSTATE;
    return null;
end;
$$;

-- Function to create a geojson index
-- for a specific layer
create or replace function f_get_geojson_index(user_ident int)
returns jsonb
language plpgsql
as $$
declare
	geojson jsonb;
	tile_geom geometry;
begin
  with
  records as
  (
    select
       distinct
      'index_'||a.id||'.geojson' as file,
       ST_AsText(st_envelope(a.geom)) as bbox
    from nomad.contract ctr 
    join nomad.usr_ctr_prf ucp on ucp.ctr_id=ctr.id and ucp.usr_id = user_ident and ucp.usc_ddel is nulL
    join  nomad.app_grid a on  st_intersects(a.geom, ST_MakeValid(ctr.geom))
  ),
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
  'name',     'index',
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

CREATE OR REPLACE FUNCTION f_get_assets_from_layer_and_ids(lyr_table_name text, ids text, user_ident integer DEFAULT NULL::integer, all_column boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
declare
    geojson jsonb;
    list_fields text;
    sql_query text;
   	list_field_array text[];
    field text;
    field_to_text text;
    field_increment integer;
begin
    
	if all_column = false then
	    SELECT
	            CONCAT(
	                string_agg(''''||nomad.underscore_to_camelcase("referenceKey")||''''||', t.'||"referenceKey", ', '),
	                ', ' ||
	                (SELECT '''ctyId'', cty.id'
	                FROM information_schema.columns
	                WHERE table_schema||'.'||table_name='asset.'||lyr_table_name and column_name='insee_code'),
	                ', ' ||
	                (SELECT '''ctrId'', ctr.id'
	                FROM information_schema.columns
	                WHERE table_schema||'.'||table_name='asset.'||lyr_table_name and column_name='code_contrat'),
	                ', ''x'', ST_X(ST_Centroid(t.geom)), ''y'', ST_Y(ST_Centroid(t.geom))'
	            )
	    INTO list_fields
	    FROM nomad.f_get_layer_references_user(user_ident, false) f
	    WHERE layer = lyr_table_name AND "displayType" = 'SYNTHETIC';
	else
		select  
	   		CONCAT(
	            STRING_AGG('''' || nomad.underscore_to_camelcase(column_name) || ''', t.' || column_name, ', '),
	            ', ' ||
	            (SELECT '''ctyId'', cty.id'
	            FROM information_schema.columns
	            WHERE table_schema||'.'||table_name='asset.'||lyr_table_name and column_name='insee_code'),
	            ', ' ||
	            (SELECT '''ctrId'', ctr.id'
	            FROM information_schema.columns
	            WHERE table_schema||'.'||table_name='asset.'||lyr_table_name and column_name='code_contrat'),
	            ', ''x'', ST_X(ST_Centroid(t.geom)), ''y'', ST_Y(ST_Centroid(t.geom))'
	        )
	    INTO list_fields
	    FROM information_schema.columns
	    WHERE table_schema || '.' || table_name = 'asset.' || lyr_table_name;
	end if;

	SELECT string_to_array(list_fields, ', ') into list_field_array;

	field_increment := 0;
    field_to_text := 'jsonb_build_object(';
	foreach field in ARRAY list_field_array
    loop
      if field_increment = 100 then
          field_to_text := field_to_text || ') || jsonb_build_object(';
          field_increment := 0;
      end if;
     
      if field_increment > 0 then
      	field_to_text := field_to_text || ',' || field;
      else
      	field_to_text := field_to_text || field;
      end if;
      field_increment := field_increment + 1;
    END LOOP;
   	field_to_text := field_to_text || ') || jsonb_build_object(''lyrTableName'', '''||lyr_table_name||''')';
   
	sql_query := FORMAT('select json_agg(%1$s) FROM %2$s t
                INNER JOIN nomad.contract ctr ON ctr.ctr_code = t.code_contrat
                LEFT JOIN nomad.city cty ON cty.cty_code = t.insee_code where t.id in (%3$s)', field_to_text, ('asset.'||lyr_table_name)::text, ids);
  
    execute sql_query into geojson;
   
    if geojson is null then
      geojson := '[]';
    end if;
    
    return geojson;
exception when others then
    raise notice 'ERROR : % - % ',SQLERRM, SQLSTATE;
    return null;
end;
$function$
;