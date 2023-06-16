package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.dto.LayerReference.LayerReferencesFlatDto;
import com.veolia.nextcanope.model.LayerReferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * LayerReferencesRepository is an interface for managing LayerReferences entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface LayerReferencesRepository extends JpaRepository<LayerReferences, Long> {
    /**
     * Get the list of layer references for a specific user.
     * It merges the default list of layer references with the user's list of layer references.
     * @param userId the user id.
     * @return the list of layer references.
     */
    @Query(
            value = "SELECT * FROM nomad.f_get_layer_references_user(:userId)",
            nativeQuery = true
    )
    List<LayerReferencesFlatDto> getLayerReferencesWithUserId(
            @Param("userId") Long userId
    );

    /**
     * Get the default list of layer references.
     * @return the default list of layer references.
     */
    @Query(
            value = "SELECT * FROM nomad.f_get_layer_references_user()",
            nativeQuery = true
    )
    List<LayerReferencesFlatDto> getDefaultLayerReferences();

    /**
     * Get the list of user references for a specific user and a specific layer.
     * It merges the default one with the user one.
     * @param userId the user id.
     * @param lyrTableName the layer table name.
     * @return the list of user references.
     */
    @Query(
            value = "SELECT * " +
                    "FROM nomad.f_get_layer_references_user(:userId)" +
                    "where layer = :lyrTableName and \"isVisible\" = true",
            nativeQuery = true
    )
    List<LayerReferencesFlatDto> getLayerReferencesWithUserIdAndLyrTableName(
            @Param("userId") Long userId,
            @Param("lyrTableName") String lyrTableName
    );
}
