package com.veolia.nextcanope.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.veolia.nextcanope.dto.WorkorderTaskReasonDto;
import com.veolia.nextcanope.model.WorkorderTaskReason;

/**
 * WorkOrderTaskReasonRepository is an interface for managing WorkOrderTaskReasonRepository entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface WorkOrderTaskReasonRepository extends JpaRepository<WorkorderTaskReason, Long> {
    @Query("select w from WorkorderTaskReason w ")
    List<WorkorderTaskReasonDto> getAllWorkorderTaskReasons();
}
