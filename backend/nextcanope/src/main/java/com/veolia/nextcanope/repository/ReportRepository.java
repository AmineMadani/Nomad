package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.configuration.NomadRepository;

import com.veolia.nextcanope.model.Report;

/**
 * ReportRepository is an interface for managing Report entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface ReportRepository extends NomadRepository<Report, Long> {
	
	/**
	 * Find report by task id and key 
	 * @param rptKey key
	 * @param tskId task
	 * @return the report
	 */
	Report findByTask_IdAndRptKey(Long tskId, String rptKey);

}
