package com.veolia.nextcanope.repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.veolia.nextcanope.model.Workorder;

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
	public List<Workorder> getWorkOrderPaginationWithCustomCriteria(Long limit, Long offset,
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

		List<Workorder> lWorkOrders = this.jdbcTemplate.query(
                "select id, wko_name, wko_creation_cell, wko_creation_comment, wko_emergency, wko_appointment, wko_address, wko_street_number, wko_planning_start_date, wko_planning_end_date, wko_completion_date, wko_realization_user, wko_realization_cell, wko_realization_comment, cty_id, cty_llabel, wts_id, str_id, str_llabel, wko_ucre_id, wko_umod_id, wko_dmod, wko_dcre, wko_ddel, longitude, latitude, wko_agent_nb from nomad.workorder "+clauseWhere+" order by wko_planning_start_date desc limit "+limit+" offset "+offset,
                new BeanPropertyRowMapper<Workorder>(Workorder.class)
        );

		return lWorkOrders;
	}
	
	/**
	 * Update geom from a workorder with the longitude and latitude
	 * @param workOrderId the workorder to update
	 */
	public void updateGeom(Long workOrderId) {
		this.jdbcTemplate.update("update nomad.workorder set geom=(select st_transform(st_setsrid(st_geomfromtext('POINT('||longitude|| ' '||latitude||')'),4326),3857) from nomad.workorder where id=?) where id=?",workOrderId,workOrderId);
	}

	public void updateGeomForTask(Long taskId) {
		this.jdbcTemplate.update("update nomad.task set geom=(select st_transform(st_setsrid(st_geomfromtext('POINT('||longitude|| ' '||latitude||')'),4326),3857) from nomad.task where id=?) where id=?",taskId,taskId);
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
