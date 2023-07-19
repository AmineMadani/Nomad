package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.constants.ConfigConstants;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
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
                "select nomad.f_get_geojson_index('" + key + "')",
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
    public String getLayerTile(String key, Long tileNumber, Long userId) {
    	String schema = ConfigConstants.SCHEMA;

		String param = ",'" + userId.toString() + "'";
    	
        return this.jdbcTemplate.queryForObject(
                "select nomad.f_get_geojson_from_tile('"+schema+"."+ key + "'," + tileNumber + param + ")",
                String.class
        );
    }
    
    /**
     * Retrieve the equipment by layer and id
     *
     * @param layer The layer
     * @param id The object id
     * @return the equipment
     */
	public List<Map<String, Object>> getEquipmentByLayerAndId(String layer, String id) {
        String query = "SELECT ST_X(ST_Transform(ST_Centroid(geom), 4326)) AS x, ST_Y(ST_Transform(ST_Centroid(geom), 4326)) AS y, * FROM asset." + layer + " WHERE id=?";
        //String query = "SELECT * FROM asset." + layer + " WHERE id=?";
        return jdbcTemplate.queryForList(query, id);
    }

    public List<Map<String, Object>> getEquipmentsByLayerAndIds(String layer, List<String> ids) {
        String placeholders = String.join(",", Collections.nCopies(ids.size(), "?"));
        System.out.println(placeholders);
        // Create the SQL query with the IN clause and placeholders
        String query = "SELECT ST_X(ST_Transform(ST_Centroid(geom), 4326)) AS x, ST_Y(ST_Transform(ST_Centroid(geom), 4326)) AS y, * FROM asset." + layer + " WHERE id IN (" + placeholders + ")";
        System.out.println(query);
        // Pass the IDs as arguments to the query
        return jdbcTemplate.queryForList(query, ids.toArray());
    }
}
