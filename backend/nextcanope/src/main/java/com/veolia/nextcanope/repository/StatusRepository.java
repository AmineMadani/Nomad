package com.veolia.nextcanope.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.veolia.nextcanope.model.WorkorderTaskStatus;

/**
 * StatusRepository is an interface for managing Status entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface StatusRepository extends JpaRepository<WorkorderTaskStatus, Long> {

	/**
     * Finds an WorkorderTaskStatus entity based on the provided wtsCode.
     *
     * @param wtsCode The status code.
     * @return The status
     */
	Optional<WorkorderTaskStatus> findOneByWtsCode(String wtsCode);
}
