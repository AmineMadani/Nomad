\encoding UTF8

set search_path to nomad, public;

-- Create view to generate for each layer
-- the list of workorder reason
create or replace view nomad.v_layer_wtr as
select t1.ast_code, replace(lyr_table_name, 'asset.', '') as lyr_table_name, wtr.wtr_slabel, wtr.wtr_llabel, t2.*
     from nomad.asset_type t1
     join nomad.ast_wtr t2 on t1.id =  t2.ast_id
left join nomad.layer l on l.ast_id = t1.id
left join nomad.workorder_task_reason wtr on t2.wtr_id = wtr.id;
