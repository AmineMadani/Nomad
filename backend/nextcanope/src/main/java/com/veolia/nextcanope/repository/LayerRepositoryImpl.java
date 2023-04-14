package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.constants.ConfigConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * LayerRepositoryImpl is a repository class for managing layer-related data in the persistence layer.
 * It uses JdbcTemplate for executing SQL queries.
 */
@Repository
public class LayerRepositoryImpl {

	@Autowired
    private JdbcTemplate jdbcTemplate;

	/**
     * Retrieves the index associated with a specific key.
     *
     * @param key The key to search for in the database.
     * @return The index as a string, associated with the given key.
     */
	public String getIndexByKey(String key) {
        return this.jdbcTemplate.queryForObject(
                "select config.get_geojson_index('" + key + "')",
                String.class
        );
    }

	/**
     * Retrieves the layer tile associated with a specific key and tile number.
     *
     * @param key        The key to search for in the database.
     * @param tileNumber The tile number to search for in the database.
     * @return The layer tile as a string, associated with the given key and tile number.
     */
    public String getLayerTile(String key, Long tileNumber, Integer userId) {
    	String schema = ConfigConstants.SCHEMA;

		String param = ",'" + userId.toString() + "'";
    	if(key.equals("intervention")) {
    		schema = "exploitation";
    		param = "";
    	}
    	
        return this.jdbcTemplate.queryForObject(
                "select config.get_geojson_from_tile('"+schema+"."+ key + "'," + tileNumber + param + ")",
                String.class
        );
    }
}
