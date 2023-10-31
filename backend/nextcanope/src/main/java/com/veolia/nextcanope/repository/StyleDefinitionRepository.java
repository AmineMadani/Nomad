package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.configuration.NomadRepository;

import com.veolia.nextcanope.model.StyleDefinition;

/**
 * StyleDefinitionRepository is an interface for managing style definition entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface StyleDefinitionRepository extends NomadRepository<StyleDefinition, Long> {
	
}
