-- Insert all column names from tables in asset schema

insert into config.layer_references(
    pg_table,
    reference_key,
    alias)
select  (table_schema||'.'||table_name)::regclass, column_name, initcap(replace(column_name,'_',' '))
  from information_schema.columns c
 where table_schema = 'asset'
   and exists (select 1 from config.layer l where l.pg_table::text =  (table_schema||'.'||table_name)::text)
 order by 1, ordinal_position
    on conflict do nothing;

-- get Alias from csv file

update public.temp_layer_references
   set pg_table = 'asset.' || pg_table;

update config.layer_references r
   set alias = t.alias_name
  from public.temp_layer_references t
 where t.pg_table::text = t.pg_table::text
   and t.column_name = r.reference_key;

-- Insert default conf from csv  

insert into config.layer_references_default(
    layer_reference_id,
    position,
    display_type,
    section,
    isvisible)
select r.id, t.position::int, t.display_type::config.layer_references_display_type, t.section, case when t.notvisible = '1' then false else true end
  from config.layer_references r
  join  public.temp_layer_references t on t.pg_table::text = r.pg_table::text and t.column_name = r.reference_key and t.display_type is not null
 order by r.pg_table::text, 2::int;

 DROP TABLE IF EXISTS public.temp_layer_references;
