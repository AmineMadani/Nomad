package com.veolia.nextcanope.repository;
import com.veolia.nextcanope.model.LayerReferencesUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * LayerReferencesUserRepository is an interface for managing LayerReferencesUser entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface LayerReferencesUserRepository extends JpaRepository<LayerReferencesUser, Long> {
    Optional<LayerReferencesUser> findByLayerReferences_IdAndUser_Id(Long lrfId, Long lruUserId);
}
