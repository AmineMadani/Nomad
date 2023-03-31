package com.veolia.nextcanope.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * PatrimonyRepositoryImpl is a repository class for managing patrimony-related data in the persistence layer.
 * It uses JdbcTemplate for executing SQL queries.
 */
@Repository
public class PatrimonyRepositoryImpl {

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
     * Retrieves the equipment tile associated with a specific key and tile number.
     *
     * @param key        The key to search for in the database.
     * @param tileNumber The tile number to search for in the database.
     * @return The equipment tile as a string, associated with the given key and tile number.
     */
    public String getEquipmentTile(String key, Long tileNumber) {
        return this.jdbcTemplate.queryForObject(
                "select config.get_geojson_from_tile('consolidated_data."+ key + "'," + tileNumber + ",'id, commune, rue, geom')",
                String.class
        );
    }
}
