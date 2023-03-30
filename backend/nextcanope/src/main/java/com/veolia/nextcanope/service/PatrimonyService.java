package com.veolia.nextcanope.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class PatrimonyService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public String getIndexByKey(String key) {
        return this.jdbcTemplate.queryForObject(
                "select config.get_geojson_index('" + key + "')",
                String.class
        );
    }

    public String getEquipmentTile(String key, Long tileNumber) {
        return this.jdbcTemplate.queryForObject(
                "select config.get_geojson_from_tile('consolidated_data."+ key + "'," + tileNumber + ",'id, commune, rue, geom')",
                String.class
        );
    }
}
