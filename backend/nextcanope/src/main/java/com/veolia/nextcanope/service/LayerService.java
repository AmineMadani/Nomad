package com.veolia.nextcanope.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.repository.LayerRepositoryImpl;

/**
 * PatrimonyService is a service class for managing patrimony-related data.
 * It interacts with the PatrimonyRepositoryImpl to access and manipulate the data.
 */
@Service
public class LayerService {

    @Autowired
    private LayerRepositoryImpl layerRepositoryImpl;

    /**
     * Retrieves the index associated with a specific key.
     *
     * @param key The key to search for in the database.
     * @return The index as a string, associated with the given key.
     */
    public String getIndexByKey(String key) {
        return layerRepositoryImpl.getIndexByKey(key);
    }

    /**
     * Retrieves the equipment tile associated with a specific key and tile number.
     *
     * @param key        The key to search for in the database.
     * @param tileNumber The tile number to search for in the database.
     * @return The equipment tile as a string, associated with the given key and tile number.
     */
    public String getLayerTile(String key, Long tileNumber, Integer userId) {
        return layerRepositoryImpl.getLayerTile(key, tileNumber, userId);
    }
}
