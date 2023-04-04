package com.veolia.nextcanope.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.veolia.nextcanope.model.Intervention;

/**
 * InterventionRepository is an interface for managing Intervention entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface InterventionRepository extends JpaRepository<Intervention, Long> {

	/**
	 * Get the list of intervention by most recent date begin limited in number with offset for pagination
	 * @param limitNb The number of intervention to get
	 * @param offset The pagination offset to set
	 * @return the intervention list
	 */
	@Query("select i from Intervention i order by i.datebegin desc limit :limitNb offset :offset")
	List<Intervention> getInterventionsWithOffsetOrderByMostRecentDateBegin(@Param("limitNb") Long limitNb, @Param("offset") Long offset);
}
