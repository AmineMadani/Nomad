package com.veolia.nextcanope.service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.veolia.nextcanope.dto.AccountTokenDto;
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
	
	private static final Logger logger = LoggerFactory.getLogger(WorkOrderService.class);

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
    public List<Workorder> getWorkOrdersWithOffsetOrderByMostRecentDateBegin(Long limit, Long offset, HashMap<String, String[]> searchParameter) {
    	return workOrderRepositoryImpl.getWorkOrderPaginationWithCustomCriteria(limit, offset, searchParameter);
    }
    
    /**
     * Method to create a workorder
     * @param workOrderRaw
     * @return the workorder dto
     */
    public Workorder createWorkOrder(String workOrderRaw, String assetRaw, AccountTokenDto account) {
    	ObjectMapper mapper = new ObjectMapper();
    	Workorder workorder = null;
    	Asset asset = new Asset();
		try {
			workorder = mapper.readValue(workOrderRaw, Workorder.class);
			workorder.setWkoUcreId(account.getId());
			workorder.setWkoUmodId(account.getId());
			workorder.setWkoDcre(new Date());
			workorder.setWkoDmod(new Date());
			workorder.setWkoExtToSync(true);
			
			WorkorderTaskStatus status = statusService.getStatus("CREE");
			workorder.setWtsId(status.getId());
			
			asset = mapper.readValue(assetRaw, Asset.class);
			if(asset.getAssObjTable().equals("xy")) {
				asset.setAssObjRef("none");
			}
			asset = assetService.getAsset(mapper.readValue(assetRaw, Asset.class), account);
			workorder.setAssId(asset.getId());
			
			City city = cityRepository.findById(workorder.getCtyId()).get();
			workorder.setCtyLlabel(city.getCtyLlabel());
			
			workorder = workOrderRepository.save(workorder);
			
			if(workorder.getLongitude() != null && workorder.getLatitude() != null) {
				workOrderRepositoryImpl.updateGeom(workorder.getId());
			}
			
		} catch (JsonProcessingException e) {
			logger.error("Error in the workorder creation for the user "+account.getId(), workOrderRaw, assetRaw);
			logger.error("Exception",e);
		}
		if(workorder == null) {
			return null;
		}
    	return workorder;
    }
}
