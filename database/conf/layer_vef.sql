-- Insert all column names from tables in asset schema
set search_path to nomad, public;

insert into layer_references(
    lyr_table_name,
    reference_key,
    alias)
select table_name::text, column_name, initcap(replace(column_name,'_',' '))
  from information_schema.columns c
 where table_schema = 'asset'
   and exists (select 1 from layer l where l.lyr_table_name::text =  table_name::text)
 order by 1, ordinal_position
    on conflict do nothing;

-- get Alias from csv file

--update public.temp_layer_references
--   set pg_table = 'asset.' || pg_table;

update layer_references r
   set alias = t.alias_name
  from public.temp_layer_references t
 where t.lyr_table_name::text = r.lyr_table_name::text
   and t.column_name = r.reference_key;

-- Insert default conf from csv

insert into layer_references_default(
    layer_reference_id,
    position,
    display_type,
    section,
    isvisible)
select r.id, t.position::int, t.display_type::layer_references_display_type, t.section, case when t.notvisible = '1' then false else true end
  from layer_references r
  join  public.temp_layer_references t on t.lyr_table_name::text = r.lyr_table_name::text and t.column_name = r.reference_key and t.display_type is not null
 order by r.lyr_table_name::text, 2::int;

 DROP TABLE IF EXISTS public.temp_layer_references;
