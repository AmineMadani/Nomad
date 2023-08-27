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
     * @param referential The referential to load
     * @return The data referential to load.
     */
	public List<Map<String, Object>> getReferentialData(String referential) {
		String getColumns = "SELECT string_agg(quote_ident(attname), ', ' ORDER BY attnum) as res FROM pg_attribute WHERE  attrelid = 'nomad."+referential+"'::regclass AND NOT attisdropped AND attnum > 0 and attname <> 'geom'";
		List<String> columns = jdbcTemplate.queryForList(getColumns, String.class);
		
		return jdbcTemplate.queryForList("select "+columns.get(0)+" from nomad."+referential);
    }
	
	/**
     * Retrieves all the referential id that intersect a coordinate.
     *
     * @param referential The referential to load
     * @param longitude X coordinate
     * @param latitude Y coordinate
     * @return The list of ID.
     */
	public List<Long> getReferentialIdByLongitudeLatitude(String referential, String longitude, String latitude) {
		String query = "SELECT id "
				+ "FROM nomad."+referential+" c "
				+ "WHERE ST_Intersects(c.geom, st_transform(st_setsrid(st_geomfromtext('POINT('||'"+longitude+"'|| ' '||'"+latitude+"'||')'),4326),3857))";
		return jdbcTemplate.queryForList(query, Long.class);
	}
}
