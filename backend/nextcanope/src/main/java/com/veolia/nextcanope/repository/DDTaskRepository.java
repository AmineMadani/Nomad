package com.veolia.nextcanope.repository;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class DDTaskRepository {

	@Autowired
    private JdbcTemplate jdbcTemplate;
	
	private SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    public String getTasksForDD(
                        String modificationDateRef, 
                        String contractsList,
                        String statusList
                        ) {
        StringBuilder clauseWhere = new StringBuilder();

        clauseWhere.append(" where ctr.ctr_code = ANY(string_to_array('");
        clauseWhere.append(contractsList);
        clauseWhere.append("', ','))");

        if ((statusList != null) && (!statusList.equals(""))) {
            clauseWhere.append(" and   wts.wts_code = ANY(string_to_array('");
            clauseWhere.append(statusList);
            clauseWhere.append("', ','))");
        }

        // String formatModificationDateRef = sdf.format(modificationDateRef);

        clauseWhere.append("  and   tsk.tsk_dmod >= to_date('");
        clauseWhere.append(modificationDateRef);
        clauseWhere.append("','YYYY-MM-DDTHH:MI:SS')");

        return this.jdbcTemplate.queryForObject(" WITH tasks AS ( "+
           "select  distinct ON (tsk.id)  "+
        "json_build_object( "+
        "'task_id',tsk.id, "+
        "'tsk_name',tsk.tsk_name, "+
        "'task_status_code',wts.wts_code, "+
        "'task_status_label',wts.wts_llabel, "+
        " 'task_reason_code',wtr.wtr_code, "+
        " 'task_reason_label',wtr.wtr_llabel, "+
        " 'task_coment',tsk.tsk_comment, "+
        " 'contract_code',ctr.ctr_code, "+
        " 'contract_label',ctr.ctr_llabel, "+
        " 'asset_ref',ass.ass_obj_ref, "+
        " 'asset_layer_table',ass.ass_obj_table, "+
        " 'task_planning_start_date',tsk.tsk_planning_start_date, "+
        " 'task_planning_end_date',tsk.tsk_planning_end_date, "+
        " 'task_completion_start_date',tsk.tsk_completion_start_date, "+
        " 'task_completion_end_date',tsk.tsk_completion_end_date, "+
        " 'task_realization_user',tsk.tsk_realization_user, "+
        " 'task_report_date',tsk.tsk_report_date, "+
        " 'task_cancel_comment',tsk.tsk_cancel_comment, "+
        " 'task_date_creation',tsk.tsk_dcre, "+
        " 'task_date_modification',tsk.tsk_dmod, "+
        " 'longitude',tsk.longitude, "+
        " 'latitude',tsk.latitude, "+
        " 'workorder',json_build_object( "+
        " 'wko_id',wko.id, "+
        " 'wko_name',wko.wko_name, "+
        " 'wko_creation_comment',wko.wko_creation_comment, "+
        " 'wko_emergency',wko.wko_emergency, "+
        " 'wko_appointment',wko.wko_appointment, "+
        " 'wko_address',wko.wko_address, "+
        " 'wko_street_number',wko.wko_street_number, "+
        " 'wko_planning_start_date',wko.wko_planning_start_date, "+
        " 'wko_planning_end_date',wko.wko_planning_end_date, "+
        " 'wko_completion_start_date',wko.wko_completion_start_date, "+
        " 'wko_completion_end_date',wko.wko_completion_end_date, "+
        " 'wko_realization_user',wko.wko_realization_user, "+
        " 'wko_realization_comment',wko.wko_realization_comment, "+
        " 'wko_agent_nb',wko.wko_agent_nb, "+
        " 'wko_cancel_comment',wko.wko_cancel_comment, "+
        " 'longitude',wko.longitude, "+
        " 'latitude',wko.latitude, "+
        " 'wko_date_creation',wko.wko_dcre, "+
        " 'wko_date_modification',wko.wko_dcre, "+
        " 'wko_ext_ref',wko.wko_ext_ref, "+
        " 'city_code',cty.cty_code, "+
        " 'city_label',wko.cty_llabel, "+
        " 'wko_status_code',wts2.wts_code, "+
        " 'wko_status_label',wts2.wts_llabel)) as tache "+
        " from   nomad.task tsk "+
        " inner join nomad.workorder wko on wko.id = tsk.wko_id  "+
        " inner join nomad.contract ctr on ctr.id  = tsk.ctr_id  "+
        " inner join nomad.workorder_task_reason wtr on wtr.id = tsk.wtr_id "+
        " inner join nomad.workorder_task_status wts on wts.id = tsk.wts_id "+
        " inner join nomad.asset ass on ass.id = tsk.ass_id "+
        " left join nomad.city cty on cty.id = wko.cty_id  "+
        " inner join nomad.workorder_task_status wts2 on wts2.id = wko.wts_id "+
        " left join nomad.street str on str.id = wko.str_id " + clauseWhere + " limit 2000 " +
        " ) "+
        " select jsonb_agg(tache) from tasks",
                String.class
        );
	}



}
