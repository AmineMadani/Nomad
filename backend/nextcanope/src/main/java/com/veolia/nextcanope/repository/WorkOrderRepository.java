package com.veolia.nextcanope.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.veolia.nextcanope.model.Workorder;

/**
 * WorkOrderRepository is an interface for managing WorkOrder entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface WorkOrderRepository extends JpaRepository<Workorder, Long> {

	/**
	 * Get the list of WorkOrder by most recent date planned limited in number with offset for pagination
	 * @param limitNb The number of intervention to get
	 * @param offset The pagination offset to set
	 * @return the WorkOrder list
	 */
	@Query("select i from Workorder i order by i.wkoPlanningStartDate desc limit :limitNb offset :offset")
	List<Workorder> getInterventionsWithOffsetOrderByMostRecentDateBegin(@Param("limitNb") Long limitNb, @Param("offset") Long offset);
}
