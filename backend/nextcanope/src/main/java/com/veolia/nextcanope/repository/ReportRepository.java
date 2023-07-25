package com.veolia.nextcanope.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.veolia.nextcanope.model.Report;

/**
 * ReportRepository is an interface for managing Report entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface ReportRepository extends JpaRepository<Report, Long> {
	
	/**
	 * Find report by task id and key 
	 * @param rptKey key
	 * @param tskId task
	 * @return the report
	 */
	Report findByTskIdAndRptKey(Long tskId, String rptKey);

}
