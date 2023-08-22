package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.model.OrganizationalUnit;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * OrganizationalUnitRepository is a repository class for managing organizational unit-related data.
 * It extends the JpaRepository interface provided by Spring Data JPA.
 */
public interface OrganizationalUnitRepository extends JpaRepository<OrganizationalUnit, Long> {
}
