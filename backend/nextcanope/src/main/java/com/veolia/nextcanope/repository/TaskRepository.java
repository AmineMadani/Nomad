package com.veolia.nextcanope.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.veolia.nextcanope.model.Task;

/**
 * WorkOrderRepository is an interface for managing WorkOrder entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface TaskRepository extends JpaRepository<Task, Long> {

}
