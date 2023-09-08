\encoding UTF8

set search_path to nomad, public;

-- Create view to generate for each layer
-- the list of workorder reason
create or replace view nomad.v_layer_wtr as
select
    t1.ast_code as astCode,
    t1.ast_slabel as astSlabel,
    t1.ast_llabel as astLlabel,
    lyr_table_name as lyrTableName,
    wtr.wtr_slabel as wtrSlabel,
    wtr.wtr_llabel as wtrLlabel,
    wtr.wtr_code as wtrCode,
    t2.wtr_id as wtrId,
    t2.ast_id as astId,
    t2.asw_valid as aswValid,
    t2.asw_ucre_id as aswUcreId,
    t2.asw_umod_id as aswUmodId,
    t2.asw_dcre as aswDcre,
    t2.asw_dmod as aswDmod
from nomad.asset_type t1
         join nomad.ast_wtr t2 on t1.id =  t2.ast_id
         left join nomad.layer l on l.ast_id = t1.id
         left join nomad.workorder_task_reason wtr on t2.wtr_id = wtr.id;

create or replace view asset.task as
select distinct CAST(t.id AS text) as id, w.wko_name, w.wko_creation_comment, w.wko_emergency, w.wko_appointment, w.wko_address, w.wko_street_number, w.wko_planning_start_date, w.wko_agent_nb, w.wko_planning_end_date, w.wko_completion_start_date, w.wko_completion_end_date, w.cty_id, w.cty_llabel, t.wts_id, w.wts_id as wko_wts_id, w.str_id, w.str_llabel, t.longitude, t.latitude, t.geom, t.ass_id, t.ctr_id, w.id as wko_id, t.wtr_id, a.ass_obj_ref, a.ass_obj_table, t.tsk_completion_start_date, t.tsk_completion_end_date, w.wko_attachment from nomad.workorder w 
inner join nomad.task t on t.wko_id=w.id
inner join nomad.asset a on a.id=t.ass_id;
