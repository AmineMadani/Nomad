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
public interface WorkorderRepository extends JpaRepository<Workorder, Long> {

	/**
	 * Get the list of WorkOrder by most recent date planned limited in number with offset for pagination
	 * @param limitNb The number of intervention to get
	 * @param offset The pagination offset to set
	 * @return the WorkOrder list
	 */
	@Query("select i from Workorder i order by i.wkoPlanningStartDate desc limit :limitNb offset :offset")
	List<Workorder> getInterventionsWithOffsetOrderByMostRecentDateBegin(@Param("limitNb") Long limitNb, @Param("offset") Long offset);
	
	/**
	 * Get the list of workorder link to an asset by his ID and Layer
	 * @param layer The target layer
	 * @param ref The asset ref
	 * @return workorders history of an asset
	 */
	@Query("select i from Workorder i where i.asset.assObjRef=:ref and i.asset.assObjTable=:layer order by i.wkoPlanningStartDate desc")
	List<Workorder> getWorkordersLinkToEquipment(@Param("layer") String layer, @Param("ref") String ref);
}
