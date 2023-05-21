package com.veolia.nextcanope.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.model.WorkorderTaskStatus;
import com.veolia.nextcanope.repository.StatusRepository;

/**
 * StatusService is a service class for managing status-related data.
 * It interacts with the statusRepository to access and manipulate the data.
 */
@Service
public class StatusService {
	
    @Autowired
    StatusRepository statusRepository;

    /**
     * Retrieves a status by his code.
     *
     * @return The status.
     */
    public WorkorderTaskStatus getStatus(String statusCode) {
        return statusRepository.findByWtsCode(statusCode);
    }
}