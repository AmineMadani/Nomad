\encoding UTF8

-- Insert all column names from tables in asset schema
set search_path to nomad, public;

insert into layer_references(
    lyr_id,
    lrf_reference_key,
    lrf_llabel)
    select l.id, column_name, initcap(replace(column_name,'_',' '))
      from information_schema.columns c
      join layer l on table_schema::text||'.'||table_name::text = 'asset.'||l.lyr_table_name::text
     order by 1, ordinal_position
    on conflict do nothing;

-- get Alias from csv file

--update public.temp_layer_references
--   set pg_table = 'asset.' || pg_table;

update layer_references r
   set lrf_llabel = t.alias_name
  from public.temp_layer_references t
  join layer l on split_part(l.lyr_table_name::text,'.',2) = 'asset.'||t.lyr_table_name::text
 where t.column_name = r.lrf_reference_key;

-- Insert default conf from csv

insert into layer_references_default(
    lrd_id,
    lrd_position,
    lrd_display_type,
    lrd_section,
    lrd_isvisible)
select r.id, coalesce(t.position::int,0),  coalesce(t.display_type::layer_references_display_type,'DETAILED'), coalesce(t.section,'MÃ©tadonnÃ©es'), case when t.notvisible = '1' then false else true end
  from layer_references r
  join layer l on r.lyr_id = l.id
  join public.temp_layer_references t on l.lyr_table_name::text = t.lyr_table_name::text and t.column_name = r.lrf_reference_key and t.display_type is not null
 order by l.lyr_table_name::text, 2::int;

 --DROP TABLE IF EXISTS public.temp_layer_references;
