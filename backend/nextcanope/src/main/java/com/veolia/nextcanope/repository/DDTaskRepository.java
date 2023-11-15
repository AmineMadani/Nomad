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

    public String getTasks(
                        String modificationDateRef, 
                        String contractsList,
                        String statusList
                        ) {
        StringBuilder clauseWhere = new StringBuilder();

        clauseWhere.append(" where contract_code = ANY(string_to_array('");
        clauseWhere.append(contractsList);
        clauseWhere.append("', ','))");

        if ((statusList != null) && (!statusList.equals(""))) {
            clauseWhere.append(" and   task_status_code = ANY(string_to_array('");
            clauseWhere.append(statusList);
            clauseWhere.append("', ','))");
        }

        // String formatModificationDateRef = sdf.format(modificationDateRef);

        clauseWhere.append("  and   task_date_modification >= to_date('");
        clauseWhere.append(modificationDateRef);
        clauseWhere.append("','YYYY-MM-DDTHH:MI:SS')");

        return this.jdbcTemplate.queryForObject(" WITH tasks AS ( "+
                            " select  distinct ON (task_id) "+
                            " json_build_object( "+
                            " 'task_id',task_id, "+
                            " 'task_name',tsk_name, "+
                            " 'task_status_code',task_status_code, "+
                            " 'task_status_label',task_status_label, "+
                            " 'task_reason_code',task_reason_code, "+
                            " 'task_reason_label',task_reason_label, "+
                            " 'task_coment',task_coment, "+
                            " 'contract_code',contract_code, "+
                            " 'contract_label',contract_label, "+
                            " 'asset_ref',asset_ref, "+
                            " 'asset_layer_table',asset_layer_table, "+
                            " 'task_planning_start_date',task_planning_start_date, "+
                            " 'task_planning_end_date',task_planning_end_date, "+
                            " 'task_completion_start_date',task_completion_start_date, "+
                            " 'task_completion_end_date',task_completion_end_date, "+
                            " 'task_realization_user',task_realization_user, "+
                            " 'task_report_date',task_report_date, "+
                            " 'task_cancel_comment',task_cancel_comment, "+
                            " 'task_date_creation',task_date_creation, "+
                            " 'task_date_modification',task_date_modification, "+
                            " 'longitude',longitude, "+
                            " 'latitude',latitude, "+
                            " 'workorder',json_build_object( "+
                            " 'wko_id',wko_id, "+
                            " 'wko_name',wko_name, "+
                            " 'wko_creation_comment',wko_creation_comment, "+
                            " 'wko_emergency',wko_emergency, "+
                            " 'wko_appointment',wko_appointment, "+
                            " 'wko_address',wko_address, "+
                            " 'wko_street_number',wko_street_number, "+
                            " 'wko_planning_start_date',wko_planning_start_date, "+
                            " 'wko_planning_end_date',wko_planning_end_date, "+
                            " 'wko_completion_start_date',wko_completion_start_date, "+
                            " 'wko_completion_end_date',wko_completion_end_date, "+
                            " 'wko_realization_user',wko_realization_user, "+
                            " 'wko_realization_comment',wko_realization_comment, "+
                            " 'wko_agent_nb',wko_agent_nb, "+
                            " 'wko_cancel_comment',wko_cancel_comment, "+
                            " 'longitude',wko_longitude, "+
                            " 'latitude',wko_latitude, "+
                            " 'wko_date_creation',wko_date_creation, "+
                            " 'wko_date_modification',wko_date_modification, "+
                            " 'wko_ext_ref',wko_ext_ref, "+
                            " 'city_code',city_code, "+
                            " 'city_label',city_label, "+
                            " 'wko_status_code',wko_status_code, "+
                            " 'wko_status_label',wko_status_label)) as tache "+
                            " from   nomad.data_task tsk "+ 
                            clauseWhere + " limit 3000 " +
        " ) "+
        " select jsonb_agg(strip_nulls(tache::jsonb)) as nomad_task from tasks",
                String.class
        );
	}

    public String getReportByTaskId(
                        Long task_id 
                        ) {
        StringBuilder clauseWhere = new StringBuilder();

        clauseWhere.append(" where rpt.tsk_id = ");
        clauseWhere.append(task_id);

        return this.jdbcTemplate.queryForObject(" WITH reports AS ( " +
                " select  distinct ON (id) " +
                " json_build_object( 'rpt_id',id,'tsk_id',tsk_id,'rpt_key',rpt_key,'rpt_label',rpt_label,'rpt_value',rpt_value,'rpt_dcre',rpt_dcre) AS report "+
                " from nomad.report rpt" +
                clauseWhere + 
                ")"+
                "select jsonb_agg(report) from reports ",
                String.class
        );
	}


}
