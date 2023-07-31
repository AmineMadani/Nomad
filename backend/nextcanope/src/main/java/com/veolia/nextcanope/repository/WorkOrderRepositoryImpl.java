package com.veolia.nextcanope.repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.veolia.nextcanope.dto.WorkorderDto;

/**
 * WorkOrderRepositoryImpl is a repository class for managing WorkOrder-related
 * data in the persistence layer. It uses JdbcTemplate for executing SQL
 * queries.
 */
@Repository
public class WorkOrderRepositoryImpl {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	/**
	 * Retrieves the index associated with a specific key.
	 *
	 * @param key The key to search for in the database.
	 * @return The index as a string, associated with the given key.
	 */
	public List<WorkorderDto> getWorkOrderPaginationWithCustomCriteria(Long limit, Long offset,
			HashMap<String, String[]> searchParameter) {
		String clauseWhere = "";
		String clauseDate = "";
		if (searchParameter != null && searchParameter.size() > 0) {
			clauseWhere += "where ";
			for (Map.Entry<String, String[]> entry : searchParameter.entrySet()) {
				if (!clauseWhere.equals("where ")) {
					clauseWhere += " and ";
				}
				if (entry.getKey().contains("date")) {
					if (clauseDate.equals("")) {
						clauseDate += " (";
					} else {
						clauseDate += " or ";
					}
					clauseDate += " " + entry.getKey() + " between '" + entry.getValue()[0] + "' and '"
							+ entry.getValue()[1] + "'";
				} else {
					clauseWhere += " " + entry.getKey() + " in (" + arrayToStringClause(entry.getValue()) + ")";
				}
			}
			if (!clauseDate.equals("")) {
				clauseDate += ")";
				if (!clauseWhere.equals("where ")) {
					clauseWhere += " and " + clauseDate;
				} else {
					clauseWhere += clauseDate;
				}
			}
		}

		List<WorkorderDto> lWorkOrders = this.jdbcTemplate.query(
                "select distinct CAST(t.id AS text) as id, wko_name, wko_creation_cell, wko_creation_comment, wko_emergency, wko_appointment, wko_address, wko_street_number, wko_planning_start_date, wko_planning_end_date, wko_completion_date, wko_realization_user, wko_realization_cell, wko_realization_comment, cty_id, cty_llabel, w.wts_id, str_id, str_llabel, wko_ucre_id, wko_umod_id, wko_dmod, wko_dcre, wko_ddel, w.id as wko_id, t.longitude, t.latitude, wko_agent_nb from nomad.workorder w "
                + " inner join nomad.task t on t.wko_id=w.id "+clauseWhere+" order by wko_planning_start_date desc limit "+limit+" offset "+offset,
                new BeanPropertyRowMapper<WorkorderDto>(WorkorderDto.class)
        );

		return lWorkOrders;
	}

	/**
	 * Stringify an array
	 * @param in the array
	 * @return the string
	 */
	private String arrayToStringClause(String[] in) {
		String out = "";
		for (String str : in) {
			out += "'" + str + "',";
		}
		out = out.substring(0, out.length() - 1);
		return out;
	}
}
