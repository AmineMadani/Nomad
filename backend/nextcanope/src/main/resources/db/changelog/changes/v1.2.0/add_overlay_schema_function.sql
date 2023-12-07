CREATE SCHEMA IF NOT EXISTS overlay;

CREATE OR REPLACE FUNCTION nomad.f_get_geojson_from_tile_overlay(lyr_table_name text, tile_id integer)
 RETURNS jsonb
 LANGUAGE plpgsql
AS '
declare
    geojson jsonb;
    tile_geom geometry;
    list_fields text;
    crs jsonb;
    sql_query text;
begin
    tile_geom := (select geom from nomad.app_grid where id = tile_id);
    --
    crs := jsonb_build_object(''name'', ''urn:ogc:def:crs:EPSG::''||nomad.get_srid());
    crs :=  jsonb_build_object(''type'', ''name'', ''properties'', crs);
    --
    SELECT
            STRING_AGG('''''''' || nomad.underscore_to_camelcase(column_name) || '''''', t.'' || column_name, '', '')
        INTO list_fields
        FROM information_schema.columns
        WHERE table_schema || ''.'' || table_name = ''overlay.'' || lyr_table_name;
    --
    sql_query := FORMAT(''
        WITH features AS (
            SELECT DISTINCT ON (t.id)
                jsonb_build_object(
                    ''''type'''', ''''Feature'''',
                    ''''id'''', t.id,
                    ''''geometry'''', ST_AsGeoJSON(t.geom)::jsonb,
                    ''''properties'''', jsonb_build_object(%1$s)
                ) as feature
            FROM %2$s t
            WHERE st_intersects(t.geom, ''''%3$s''''::geometry)
        )
        SELECT
            jsonb_build_object(
                ''''crs'''', ''''%4$s''''::jsonb,
                ''''name'''', ''''%2$s'''',
                ''''type'''', ''''FeatureCollection'''',
                ''''features'''', jsonb_agg(feature)
            )
        FROM features;
    '', list_fields, (''overlay.''||lyr_table_name)::text, tile_geom::text, crs);

    raise notice ''%'',sql_query;
    execute sql_query into geojson;

    return geojson;
exception when others then
    raise notice ''ERROR : % - % '',SQLERRM, SQLSTATE;
    return null;
end;
'
;

