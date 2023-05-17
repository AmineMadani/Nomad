package com.veolia.nextcanope.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.veolia.nextcanope.dto.AccountTokenDto;
import com.veolia.nextcanope.dto.WorkOrderDto;
import com.veolia.nextcanope.model.Asset;
import com.veolia.nextcanope.model.City;
import com.veolia.nextcanope.model.Workorder;
import com.veolia.nextcanope.model.WorkorderTaskStatus;
import com.veolia.nextcanope.repository.CityRepository;
import com.veolia.nextcanope.repository.WorkOrderRepositoryImpl;
import com.veolia.nextcanope.repository.WorkorderRepository;

/**
 * WorkOrderService is a service class for managing workorder-related data.
 * It interacts with the WorkOrderRepository to access and manipulate the data.
 */
@Service
public class WorkOrderService {

    @Autowired
    private WorkOrderRepositoryImpl workOrderRepositoryImpl;
    
    @Autowired
    private WorkorderRepository workOrderRepository;
    
    @Autowired 
    private AssetService assetService;
    
    @Autowired 
    private CityRepository cityRepository;
    
    @Autowired
    private StatusService statusService;

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
    
    /**
     * Method to create a workorder
     * @param workOrderRaw
     * @return the workorder dto
     */
    public WorkOrderDto createWorkOrder(String workOrderRaw, String assetRaw, AccountTokenDto account) {
    	ObjectMapper mapper = new ObjectMapper();
    	Workorder workorder = new Workorder();
    	Asset asset = new Asset();
		try {
			workorder = mapper.readValue(workOrderRaw, Workorder.class);
			workorder.setWkoUcreId(account.getId());
			workorder.setWkoUmodId(account.getId());
			workorder.setWkoDcre(new Date());
			workorder.setWkoDmod(new Date());
			
			WorkorderTaskStatus status = statusService.getStatus("CREE");
			workorder.setWtsId(status.getId());
			
			asset = assetService.getAsset(mapper.readValue(assetRaw, Asset.class), account);
			workorder.setAssId(asset.getId());
			
			City city = cityRepository.findById(workorder.getCtyId()).get();
			workorder.setCtyLlabel(city.getCtyLlabel());
			
			workOrderRepository.save(workorder);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    	System.out.println(workorder);
    	System.out.println(asset);
    	return null;
    }
}
