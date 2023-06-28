package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.model.Tree;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * TreeRepository is an interface for managing Tree entities .
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface TreeRepository extends JpaRepository<Tree, Long> {
}
