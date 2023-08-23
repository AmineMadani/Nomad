package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.model.Permissions;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * PermissionRepository is a repository class for managing organizational unit-related data.
 * It extends the JpaRepository interface provided by Spring Data JPA.
 */
public interface PermissionRepository extends JpaRepository<Permissions, Long> {
}
