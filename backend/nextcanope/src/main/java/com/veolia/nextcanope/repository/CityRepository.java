package com.veolia.nextcanope.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.veolia.nextcanope.model.City;

/**
 * CityRepository is an interface for managing City entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface CityRepository extends JpaRepository<City, Long> {

}
