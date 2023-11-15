package com.veolia.nextcanope.repository;

import java.util.Date;
import java.util.List;

import com.veolia.nextcanope.configuration.NomadRepository;
import com.veolia.nextcanope.dto.TaskSearchDto;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.veolia.nextcanope.model.Workorder;

/**
 * WorkOrderRepository is an interface for managing WorkOrder entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface WorkorderRepository extends NomadRepository<Workorder, Long> {
	
	/**
     * Find a workorder based on the cache id
     *
     * @param wkoCacheId The unique cache id
     * @return A workorder.
     */
    Workorder findByWkoCacheId(Long wkoCacheId);

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
	@Query(value="select distinct w.* from nomad.workorder w  "
			+ "inner join nomad.task t on t.wko_id=w.id "
			+ "inner join nomad.asset a on t.ass_id=a.id "
			+ "where a.ass_obj_ref=:ref and a.ass_obj_table=:layer "
			+ "order by w.wko_planning_start_date DESC",
			nativeQuery = true)
	List<Workorder> getWorkordersLinkToEquipment(@Param("layer") String layer, @Param("ref") String ref);

	/**
	 * Get the list of tasks for specific filters and pagination
	 * @param wtsIds Array of status ids
	 * @param wtrIds Array of actions ids
	 * @param appointment boolean for appointment value
	 * @param emergency boolean for emergency value
	 * @param beginDate Date before wkoPlanningStartDate
	 * @param endDate Date after wkoPlanningStartDate
	 * @param nbLimit limit for pagination
	 * @param nbOffset Offset for pagination
	 * @return workorders history of an asset
	 */
	@Query(value = "select distinct t.id as id," +
			"w.id as wkoId," +
			"wko_name as wkoName," +
			"wko_emergency as wkoEmergency," +
			"wko_appointment as wkoAppointment," +
			"w.cty_id as ctyId," +
			"t.ctr_id as ctrId," +
			"wko_address as wkoAddress," +
			"wko_planning_start_date as wkoPlanningStartDate," +
			"wko_planning_end_date as wkoPlanningEndDate," +
			"wko_planning_duration as wkoPlanningDuration," +
			"w.wts_id as wtsId," +
			"t.wtr_id as wtrId," +
			"wko_completion_start_date as wkoCompletionStartDate," +
			"wko_completion_end_date as wkoCompletionEndDate," +
			"t.longitude as longitude," +
			"t.latitude as latitude," +
			"wko_agent_nb as wkoAgentNb," +
			"wko_creation_comment as wkoCreationComment, " +
			"ass.ass_obj_table as assObjTable " +
			"from nomad.workorder w " +
			"inner join nomad.task t on t.wko_id = w.id " +
			"inner join nomad.asset ass on ass.id = t.ass_id " +
			"inner join nomad.usr_ctr_prf ucp on ucp.usr_id = :userId and ucp.usc_ddel is null and ucp.ctr_id = t.ctr_id " +
			"where (COALESCE(:wtsIds, NULL) is null or w.wts_id in :wtsIds) " +
			"and (COALESCE(:wtrIds, NULL) is null or t.wtr_id in :wtrIds) " +
			"and (COALESCE(:assObjTables, NULL) is null or ass.ass_obj_table in :assObjTables) " +
			"and (:appointment is null or w.wko_appointment = :appointment) " +
			"and (:emergency is null or w.wko_emergency = :emergency) " +
			"AND (t.tsk_planning_start_date is null or t.tsk_completion_start_date is null OR " +
			"((COALESCE(t.tsk_completion_start_date, t.tsk_planning_start_date)  >= :beginDate) " +
			"AND (COALESCE(:endDate, NULL) is null or COALESCE(t.tsk_completion_start_date, t.tsk_planning_start_date)  <= :endDate))) " +
			"order by wko_planning_start_date desc " +
			"limit :nbLimit offset :nbOffset", nativeQuery = true)
	List<TaskSearchDto> getTaskWithPaginationAndFilters(@Param("wtsIds") List<Long> wtsIds, @Param("wtrIds") List<Long> wtrIds, @Param("appointment") Boolean appointment, @Param("emergency") Boolean emergency, @Param("beginDate") Date beginDate, @Param("endDate") Date endDate, @Param("assObjTables") List<String> assObjTables, @Param("nbLimit") Long nbLimit, @Param("nbOffset") Long nbOffset, @Param("userId") Long userId);
}
