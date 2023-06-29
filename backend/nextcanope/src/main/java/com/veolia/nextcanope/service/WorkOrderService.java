package com.veolia.nextcanope.service;

import java.util.*;

import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.exception.TechnicalException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.veolia.nextcanope.dto.AccountTokenDto;
import com.veolia.nextcanope.dto.WorkorderDto;
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

			// Get the work order asset
			asset = mapper.readValue(assetRaw, Asset.class);
			if(asset.getAssObjTable().equals("xy")) {
				asset.setAssObjRef("none");
			}
			asset = assetService.getAsset(mapper.readValue(assetRaw, Asset.class), account);
			workorder.setAssId(asset.getId());

			// Get the work order city
			Optional<City> optCity = cityRepository.findById(workorder.getCtyId());
			if (optCity.isEmpty()) {
				throw new FunctionalException("La ville avec l'id " + workorder.getCtyId() + " n'existe pas.");
			}
			City city = optCity.get();
			workorder.setCtyLlabel(city.getCtyLlabel());

			// Save the work order in the database
			try {
				workorder = workOrderRepository.save(workorder);
			} catch(Exception e) {
				throw new TechnicalException("Erreur lors de la sauvegarde de l'intervention.", e.getMessage());
			}

			// Update the geom if there are some longitude and latitude
			if (workorder.getLongitude() != null && workorder.getLatitude() != null) {
				try {
					workOrderRepositoryImpl.updateGeom(workorder.getId());
				} catch (Exception e) {
					throw new TechnicalException("Erreur lors de la sauvegarde du geom de l'intervention avec l'id " + workorder.getId() + ".", e.getMessage());
				}
			}
		} catch (JsonProcessingException e) {
			throw new FunctionalException("Erreur lors de la lecture du json.", e.getMessage());
		}

		return workorder;
    }

	/**
	 * Retrieve the workorders associated with an asset given by his id and his table
	 * @param assetObjRef Id of the asset
	 * @param assetObjTable Name of the table asset
	 * @return list of workorders DTO
	 */
	public List<WorkorderDto> getEquipmentWorkorderHistory(String assetObjTable, String assetObjRef) {
		List<WorkorderDto> workordersDto = new ArrayList<WorkorderDto>();
		List<Workorder> workorders = workOrderRepository.getWorkordersLinkToEquipment(assetObjTable, assetObjRef);
		for(Workorder workorder:workorders) {
			workordersDto.add(new WorkorderDto(workorder));
		}
		return workordersDto;
	}
}
