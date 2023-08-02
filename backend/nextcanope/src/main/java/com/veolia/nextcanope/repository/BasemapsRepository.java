package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.model.Basemaps;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * BasemapsRepository is an interface for managing Basemaps entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface BasemapsRepository extends JpaRepository<Basemaps, Long> {

	/**
     * Finds a list of Basemaps entities based on the display value.
     *
     * @param mapDisplay The display value to filter the Basemaps entities. True if they should be displayed, false otherwise.
     * @return A list of filtered Basemaps entities.
     */
    List<Basemaps> findByMapDisplay(Boolean mapDisplay);
}
