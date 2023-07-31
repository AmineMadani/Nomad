package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * ContractRepository is an interface for managing Contract entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface ContractRepository extends JpaRepository<Contract, Long> {
}
