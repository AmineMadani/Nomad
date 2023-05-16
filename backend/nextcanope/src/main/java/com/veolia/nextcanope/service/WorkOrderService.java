package com.veolia.nextcanope.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.dto.WorkOrderDto;
import com.veolia.nextcanope.model.Workorder;
import com.veolia.nextcanope.repository.WorkOrderRepositoryImpl;

/**
 * WorkOrderService is a service class for managing workorder-related data.
 * It interacts with the WorkOrderRepository to access and manipulate the data.
 */
@Service
public class WorkOrderService {

    @Autowired
    private WorkOrderRepositoryImpl workOrderRepositoryImpl;

    /**
	 * Retrieve the list of workorders by most recent date planned limited in number with offset for pagination
	 * @param limitNb The number of workorder to get
	 * @param offset The pagination offset to set
     * @param searchParameter 
	 * @return the workorder list
	 */
    public List<WorkOrderDto> getWorkOrdersWithOffsetOrderByMostRecentDateBegin(Long limit, Long offset, HashMap<String, String[]> searchParameter) {
    	List<Workorder> lWorkOrderEntity = workOrderRepositoryImpl.getWorkOrderPaginationWithCustomCriteria(limit, offset, searchParameter);
    	List<WorkOrderDto> lWorkOrderDto = new ArrayList<WorkOrderDto>();
    	lWorkOrderEntity.forEach(workOrderEntity -> {
    		lWorkOrderDto.add(new WorkOrderDto(workOrderEntity));
    	});
        return lWorkOrderDto;
    }
}
