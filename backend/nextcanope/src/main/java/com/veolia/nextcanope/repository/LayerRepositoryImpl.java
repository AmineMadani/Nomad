package com.veolia.nextcanope.repository;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

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
	
	private SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

	/**
     * Retrieves the index associated with a specific key.
	 * @param userId 
     *
     * @param key The key to search for in the database.
     * @return The index as a string, associated with the given key.
     */
	public String getIndexByKey(Long userId) {
        return this.jdbcTemplate.queryForObject(
                "select nomad.f_get_geojson_index("+userId+")",
                String.class
        );
    }
	
	public String getAssetByLayerAndIds(String layer, List<String> ids, Long userId, Boolean allColumn) {
		String idsFormat = "";
		for(String id: ids) {
			idsFormat += "'"+id+"',";
		}
		idsFormat = idsFormat.substring(0, idsFormat.length() - 1);
        return this.jdbcTemplate.queryForObject(
                "select nomad.f_get_assets_from_layer_and_ids(?,?,?,?)",
                String.class, layer, idsFormat, userId.intValue(), allColumn
        );
    }

	/**
     * Retrieves the layer tile associated with a specific key and tile number.
     *
     * @param key        The key to search for in the database.
     * @param tileNumber The tile number to search for in the database.
     * @param optionnalStartDate The optional start date for tile search
     * @param userId The user id
     * @return The layer tile as a string, associated with the given key and tile number.
     */
    public String getLayerTile(String key, Long tileNumber, Date optionnalStartDate, Long userId) {
    	String formatOptionnalStartDate = (optionnalStartDate != null ? "'"+sdf.format(optionnalStartDate)+"'":null);
        return this.jdbcTemplate.queryForObject(
                "select nomad.f_get_geojson_from_tile(?,?,?,?)",
                String.class, key, tileNumber.intValue(), formatOptionnalStartDate, userId.intValue()
        );
    }

	/**
	 * Search in all visible assets  with a matching id and for contract of the user
	 * @param partialAssetId   A piece of the asset id
	 * @param userId The user id
	 * @return Json of all matching with partialAssetID assets
	 */
	public String searchAssetById(String partialAssetId, Long userId){

		return  this.jdbcTemplate.queryForObject(
				"SELECT * FROM nomad.f_get_search_asset_from_id(?,?)",
				String.class,partialAssetId, userId.intValue()
		);
	}
}
