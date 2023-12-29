CREATE OR REPLACE FUNCTION nomad.f_get_asset_ids_by_layers_and_filter_ids(
    list_lyr_table_name text,
    list_filter_id text,
    filter_type text
)
RETURNS SETOF json AS '
    DECLARE
        lyr_table_name text;
        query text;
        final_request text;
    BEGIN
        FOREACH lyr_table_name IN ARRAY (''{'' || list_lyr_table_name || ''}'')::text[]
            LOOP
                -- Query which permit to filter in the asset table
                IF filter_type = ''CONTRACT''
                THEN query := format(
                        ''SELECT a.id as id, ''''%1$s'''' as "lyrTableName"
                         FROM %2$s a INNER JOIN nomad.contract ON ctr_code = code_contrat
                         WHERE contract.id in (%3$s)'',
                        lyr_table_name,
                        (''asset.''||lyr_table_name)::text,
                        list_filter_id
                    );
                ELSEIF filter_type = ''CITY''
                THEN query := format(
                        ''SELECT a.id as id, ''''%1$s'''' as "lyrTableName"
                         FROM %2$s a INNER JOIN nomad.city ON cty_code = insee_code
                         WHERE city.id in (%3$s)'',
                        lyr_table_name,
                        (''asset.''||lyr_table_name)::text,
                        list_filter_id
                    );
                ELSE RAISE NOTICE ''Incorrect parameter: %'', filter_type;
                END IF;

                IF final_request is null
                    -- If the final request is not initialize assign the query
                THEN final_request := query;
                    -- Else append the query to the final request with union
                ELSE final_request := final_request || '' UNION '' || query;
                END IF;
            END LOOP;

        -- Map the result in json format
        final_request := format(
                ''select
                json_build_object(
                        ''''equipmentIds'''', array_agg(id),
                        ''''lyrTableName'''', "lyrTableName"
                    )
                from (%1$s) as json
                GROUP BY "lyrTableName"
                HAVING COUNT(id) > 0; '',
                final_request
            );

        RETURN QUERY EXECUTE final_request USING list_filter_id;
    END
' LANGUAGE plpgsql;