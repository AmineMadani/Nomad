package com.veolia.nextcanope.repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.veolia.nextcanope.dto.TaskSearchDto;

/**
 * WorkOrderRepositoryImpl is a repository class for managing WorkOrder-related
 * data in the persistence layer. It uses JdbcTemplate for executing SQL
 * queries.
 */
@Repository
public class WorkorderRepositoryImpl {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	/**
	 * Retrieves the index associated with a specific key.
	 *
	 * @return The index as a string, associated with the given key.
	 */
	public List<TaskSearchDto> getWorkOrderPaginationWithCustomCriteria(
			Long limit,
			Long offset,
			HashMap<String, String[]> searchParameter,
			Long userId
	) {
		StringBuilder clauseWhere = new StringBuilder();
		StringBuilder clauseDate = new StringBuilder();
		if (searchParameter != null && !searchParameter.isEmpty()) {
			clauseWhere.append("where ");
			for (Map.Entry<String, String[]> entry : searchParameter.entrySet()) {
				if (!clauseWhere.toString().equals("where ")) {
					clauseWhere.append(" and ");
				}
				if (entry.getKey().contains("date")) {
					if (clauseDate.toString().isEmpty()) {
						clauseDate.append(" (");
					} else {
						clauseDate.append(" or ");
					}
					clauseDate.append(" ").append(entry.getKey()).append(" between '").append(entry.getValue()[0]).append("' and '").append(entry.getValue()[1]).append("'");
				} else {
					clauseWhere.append(" ").append(entry.getKey()).append(" in (").append(arrayToStringClause(entry.getValue())).append(")");
				}
			}
			if (!clauseDate.toString().isEmpty()) {
				clauseDate.append(")");
				if (!clauseWhere.toString().equals("where ")) {
					clauseWhere.append(" and ").append(clauseDate);
				} else {
					clauseWhere.append(clauseDate);
				}
			}
		}

        return this.jdbcTemplate.query(
                "select distinct CAST(t.id AS text) as id, wko_name, wko_creation_cell, wko_creation_comment, wko_emergency, wko_appointment, wko_address, wko_street_number, wko_planning_start_date, wko_planning_end_date, wko_planning_duration, wko_completion_start_date, wko_completion_end_date, wko_realization_user, wko_realization_cell, wko_realization_comment, cty_id, cty_llabel, w.wts_id, str_id, str_llabel, wko_ucre_id, wko_umod_id, wko_dmod, wko_dcre, wko_ddel, w.id as wko_id, t.longitude, t.latitude, wko_agent_nb " +
					"from nomad.workorder w " +
					"inner join nomad.task t on t.wko_id=w.id " +
					"inner join nomad.usr_ctr_prf ucp on ucp.usr_id = " + userId + " and ucp.usc_ddel is null and ucp.ctr_id = t.ctr_id " +
					clauseWhere +
					" order by wko_planning_start_date desc limit "+limit+" offset "+offset,
                new BeanPropertyRowMapper<TaskSearchDto>(TaskSearchDto.class)
        );
	}

	/**
	 * Stringify an array
	 * @param in the array
	 * @return the string
	 */
	private String arrayToStringClause(String[] in) {
		StringBuilder out = new StringBuilder();
		for (String str : in) {
			out.append("'").append(str).append("',");
		}
		out = new StringBuilder(out.substring(0, out.length() - 1));
		return out.toString();
	}
}
