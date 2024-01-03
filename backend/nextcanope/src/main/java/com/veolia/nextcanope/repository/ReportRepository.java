package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.configuration.NomadRepository;

import com.veolia.nextcanope.model.Report;

import java.util.List;

/**
 * ReportRepository is an interface for managing Report entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface ReportRepository extends NomadRepository<Report, Long> {
	
	/**
	 * Find report by task id and key 
	 * @param rptKeys key
	 * @param tskId task
	 * @return the report
	 */
	List<Report> findByTask_IdAndRptKeyIn(Long tskId, List<String> rptKeys);

}
