package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.model.WorkorderTaskReason;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * WorkOrderTaskReasonRepository is an interface for managing WorkOrderTaskReasonRepository entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface WorkOrderTaskReasonRepository extends JpaRepository<WorkorderTaskReason, Long> {
}
