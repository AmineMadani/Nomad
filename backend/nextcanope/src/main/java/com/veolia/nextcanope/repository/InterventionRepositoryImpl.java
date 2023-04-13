package com.veolia.nextcanope.repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.veolia.nextcanope.model.Intervention;

/**
 * InterventionRepositoryImpl is a repository class for managing intervention-related data in the persistence layer.
 * It uses JdbcTemplate for executing SQL queries.
 */
@Repository
public class InterventionRepositoryImpl {

	@Autowired
    private JdbcTemplate jdbcTemplate;

	/**
     * Retrieves the index associated with a specific key.
     *
     * @param key The key to search for in the database.
     * @return The index as a string, associated with the given key.
     */
	public List<Intervention> getInterventionPaginationWithCustomCriteria(Long limit, Long offset, HashMap<String, String[]> searchParameter) {
        String clauseWhere = "";
        String clauseDate = "";
		if(searchParameter != null && searchParameter.size() > 0) {
			clauseWhere+="where ";
			for (Map.Entry<String, String[]> entry : searchParameter.entrySet()) {
				if(!clauseWhere.equals("where ")) {
					clauseWhere += " and ";
				}
				if(entry.getKey().contains("date")) {
					if(clauseDate.equals("")) {
						clauseDate +=" (";
					} else {
						clauseDate +=" or ";
					}
					clauseDate += " "+entry.getKey()+" between '"+entry.getValue()[0]+"' and '"+entry.getValue()[1]+"'";
				} else {
					clauseWhere += " "+entry.getKey()+" in ("+arrayToStringClause(entry.getValue())+")";
				}
			}
			if(!clauseDate.equals("")) {
				clauseDate += ")";
				if(!clauseWhere.equals("where ")) {
					clauseWhere += " and "+clauseDate;
				} else {
					clauseWhere += clauseDate;
				}
			}
        }
		System.out.println(clauseWhere);
		return this.jdbcTemplate.query(
                "select * from exploitation.intervention "+clauseWhere+" order by datebegin desc limit "+limit+" offset "+offset,
                new BeanPropertyRowMapper<Intervention>(Intervention.class)
        );
    }
	
	private String arrayToStringClause(String[] in) {
		String out = "";
		for(String str: in) {
			out+="'"+str+"',";
		}
		out = out.substring(0, out.length() - 1);  
		return out;
	}
}
