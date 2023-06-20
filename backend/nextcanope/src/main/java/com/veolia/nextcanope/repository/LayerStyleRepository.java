package com.veolia.nextcanope.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.veolia.nextcanope.dto.LayerStyleDto;
import com.veolia.nextcanope.model.LayerStyle;

/**
 * LayerStyleRepository is an interface for managing layer style entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface LayerStyleRepository extends JpaRepository<LayerStyle, Long> {
	
	
	/**
     * Get the list of layer style for a specific user.
     * It merges the default list of layer style with the user's list of layer style.
     * @param userId the user id.
     * @return the list of layer references.
     */
    @Query(
            value = "select lse_code as code, coalesce(sd2.id,sd.id) as definitionId from layer_style ls  "
            		+ "inner join style_definition sd on ls.syd_id=sd.id "
            		+ "left join layer_style_custom lsc on lsc.lse_id=ls.id and lsc.usr_id = :userId "
            		+ "left join style_definition sd2 on sd2.id=lsc.syd_id "
            		+ "where ls.lyr_id = :layerId ",
            nativeQuery = true
    )
    List<LayerStyleDto> getLayerStyleByLayerAndUser(@Param("layerId") Long layerId, @Param("userId") Long userId);
}
