package com.veolia.nextcanope.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.model.Basemaps;
import com.veolia.nextcanope.repository.BasemapsRepository;

/**
 * BasemapsService is a service class for managing basemap-related data.
 * It interacts with the basemapsRepository to access and manipulate the data.
 */
@Service
public class BasemapsService {
	
    @Autowired
    BasemapsRepository basemapsRepository;

    /**
     * Retrieves the visible basemaps.
     *
     * @return The visible basemap.
     */
    public List<Basemaps> getVisibleBasemaps() {
        // TO DO - find by user's contracts ids
        return this.basemapsRepository.findByMapDisplay(true);
    }
}
