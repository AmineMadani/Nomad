CREATE OR REPLACE FUNCTION nomad.f_get_search_asset_from_id(asset_id text, user_ident integer DEFAULT NULL::integer)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
declare
list_ass_tbl text[];
geojson jsonb[] := '{}';
res record;
r jsonb;
count integer := 0;
sql_query text;
asset_tbl text;
BEGIN 

sql_query :='';
for asset_tbl in (select 'asset.' || lyr_table_name lyr_table_name from nomad.layer where lyr_display = true and lyr_table_name !='task')
loop
	if(count <= 5) then
		sql_query := FORMAT('
					select json_build_object(''id'',tmp.id, ''code_contrat'', code_contrat ,''asset_tbl'', ''%1$s'') result
					from %1$s tmp
					inner join nomad.contract ctr ON ctr.ctr_code = tmp.code_contrat
					inner join nomad.usr_ctr_prf ucp ON ucp.ctr_id=ctr.id AND ucp.usr_id = %2$s
					AND ucp.usc_ddel IS NULL
		            where  tmp.id like upper(''%%%3$s%%'')
		    		limit %4$s'
			        , asset_tbl,  user_ident, asset_id, 5-count);
			for r in execute sql_query loop
				geojson := array_append(geojson, r);
			end loop;
			count := coalesce(CARDINALITY(geojson),0);
		end if;
	END LOOP;

   return jsonb_agg(elem) FROM unnest(geojson) AS elem;
	exception when others then raise notice 'ERROR : % - % ',
	SQLERRM,
	SQLSTATE;
	END;
	$function$
;