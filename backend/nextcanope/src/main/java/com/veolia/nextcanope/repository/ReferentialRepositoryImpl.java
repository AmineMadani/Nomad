package com.veolia.nextcanope.repository;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * ReferentialRepositoryImpl is a repository class for managing referential-related data in the persistence layer.
 * It uses JdbcTemplate for executing SQL queries.
 */
@Repository
public class ReferentialRepositoryImpl {

	@Autowired
    private JdbcTemplate jdbcTemplate;

	/**
     * Retrieves all the referential data.
     *
     * @param key The referential to load
     * @return The data referential to load.
     */
	public List<Map<String, Object>> getReferentialData(String referential) {
		final List<Map<String, Object>> rows = jdbcTemplate.queryForList("select * from referential."+referential);
		return rows;
    }
}
