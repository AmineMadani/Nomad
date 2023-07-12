\encoding UTF8

set search_path to nomad, public;

-- Create view to generate for each layer
-- the list of workorder reason
create or replace view nomad.v_layer_wtr as
select t1.ast_code, replace(lyr_table_name, 'asset.', '') as lyr_table_name, wtr.wtr_slabel, wtr.wtr_llabel, wtr.wtr_code, t2.*
     from nomad.asset_type t1
     join nomad.ast_wtr t2 on t1.id =  t2.ast_id
left join nomad.layer l on l.ast_id = t1.id
left join nomad.workorder_task_reason wtr on t2.wtr_id = wtr.id;

create or replace view asset.workorder as
select distinct CAST(w.id AS text) as id, w.wko_name, w.wko_creation_cell, w.wko_creation_comment, w.wko_emergency, w.wko_appointment, w.wko_address, w.wko_street_number, w.wko_planning_start_date, w.wko_agent_nb, w.wko_planning_end_date, w.wko_completion_date, w.wko_realization_user, w.wko_realization_cell, w.wko_realization_comment, w.cty_id, w.cty_llabel, w.wts_id, w.str_id, w.str_llabel, t.longitude, t.latitude, t.geom, t.ass_id, t.ctr_id, t.id as tsk_id, t.wtr_id from nomad.workorder w 
inner join nomad.task t on t.wko_id=w.id;
