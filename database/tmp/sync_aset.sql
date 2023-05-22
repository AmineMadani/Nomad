do $$
declare
_table text;
begin
for _table in (select table_name::text from information_schema.columns where table_schema ='asset' and column_name = 'insee_code') loop
raise notice '%', _table;
execute 'alter table asset.'||_table||' drop column if exists city_code';
execute 'alter table asset.'||_table||' add if not exists cty_id bigint';
execute 'update asset.'||_table||' t set cty_id = c.id from nomad.city c where c.cty_code = t.insee_code';
end loop;
for _table in (select table_name::text from information_schema.columns where table_schema ='asset' and column_name = 'code_contrat') loop
execute 'alter table asset.'||_table||' drop column if exists ctr_code';
execute 'alter table asset.'||_table||' add if not exists ctr_id bigint';
execute 'update asset.'||_table||' t set ctr_id = c.id from nomad.contract c where c.ctr_code = t.code_contrat';
end loop;
end
$$;