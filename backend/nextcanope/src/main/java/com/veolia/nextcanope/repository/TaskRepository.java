package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.configuration.NomadRepository;
import com.veolia.nextcanope.model.Task;

/**
 * WorkOrderRepository is an interface for managing WorkOrder entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface TaskRepository extends NomadRepository<Task, Long> {

	/**
     * Find a task based on the cache id
     *
     * @param tskCacheId The unique cache id
     * @return A workorder.
     */
    Task findByTskCacheId(Long tskCacheId);
}
