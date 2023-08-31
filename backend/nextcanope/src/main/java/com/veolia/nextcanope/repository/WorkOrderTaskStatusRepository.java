package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.dto.CityDto;
import com.veolia.nextcanope.dto.WorkorderTaskStatusDto;
import com.veolia.nextcanope.model.WorkorderTaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * WorkorderTaskStatusRepository is an interface for managing WorkorderTaskStatusRepository entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface WorkOrderTaskStatusRepository extends JpaRepository<WorkorderTaskStatus, Long> {
    @Query("select w from WorkorderTaskStatus w ")
    List<WorkorderTaskStatusDto> getAllWorkorderTaskStatus();
}
