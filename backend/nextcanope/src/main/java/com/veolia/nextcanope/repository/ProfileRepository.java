package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * ProfileRepository is a repository class for managing organizational unit-related data.
 * It extends the JpaRepository interface provided by Spring Data JPA.
 */
public interface ProfileRepository extends JpaRepository<Profile, Long> {
}
