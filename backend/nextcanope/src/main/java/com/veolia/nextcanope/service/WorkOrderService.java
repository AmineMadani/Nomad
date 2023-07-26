package com.veolia.nextcanope.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.dto.AccountTokenDto;
import com.veolia.nextcanope.dto.CustomTaskDto;
import com.veolia.nextcanope.dto.CustomWorkorderDto;
import com.veolia.nextcanope.dto.ReportValueDto;
import com.veolia.nextcanope.dto.WorkorderDto;
import com.veolia.nextcanope.exception.TechnicalException;
import com.veolia.nextcanope.model.Asset;
import com.veolia.nextcanope.model.City;
import com.veolia.nextcanope.model.Report;
import com.veolia.nextcanope.model.Task;
import com.veolia.nextcanope.model.Workorder;
import com.veolia.nextcanope.model.WorkorderTaskStatus;
import com.veolia.nextcanope.repository.CityRepository;
import com.veolia.nextcanope.repository.ReportRepository;
import com.veolia.nextcanope.repository.TaskRepository;
import com.veolia.nextcanope.repository.WorkOrderRepositoryImpl;
import com.veolia.nextcanope.repository.WorkorderRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

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
    private TaskRepository taskRepository;
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired 
    private AssetService assetService;
    
    @Autowired 
    private CityRepository cityRepository;
    
    @Autowired
    private StatusService statusService;
    
    @PersistenceContext
    private EntityManager entityManager;

    /**
	 * Retrieve the list of workorders by most recent date planned limited in number with offset for pagination
	 * @param limit The number of workorder to get
	 * @param offset The pagination offset to set
     * @param searchParameter 
	 * @return the workorder list
	 */
    public List<WorkorderDto> getWorkOrdersWithOffsetOrderByMostRecentDateBegin(Long limit, Long offset, HashMap<String, String[]> searchParameter) {
    	return workOrderRepositoryImpl.getWorkOrderPaginationWithCustomCriteria(limit, offset, searchParameter);
    }
    
    /**
     * Method to create a workorder
     * @param customWorkorderDto
     * @return the workorder dto
     */
    @Transactional
    public CustomWorkorderDto createWorkOrder(CustomWorkorderDto customWorkorderDto, AccountTokenDto account) {
    	Workorder workorder = new Workorder();

		try {
			workorder.setWkoName(customWorkorderDto.getWkoName());
	        workorder.setWkoEmergency(customWorkorderDto.getWkoEmergency());
	        workorder.setWkoAddress(customWorkorderDto.getWkoAddress());
	        workorder.setWkoPlanningStartDate(customWorkorderDto.getWkoPlanningStartDate());
	        workorder.setWkoPlanningEndDate(customWorkorderDto.getWkoPlanningEndDate());
	        workorder.setWkoCompletionDate(customWorkorderDto.getWkoCompletionDate());
	        workorder.setLongitude(customWorkorderDto.getLongitude());
	        workorder.setLatitude(customWorkorderDto.getLatitude());
			workorder.setWkoCreationComment(customWorkorderDto.getWkoCreationComment());
	        workorder.setWkoAgentNb(customWorkorderDto.getWkoAgentNb());
			
			workorder.setWkoUcreId(account.getId());
			workorder.setWkoUmodId(account.getId());
			workorder.setWkoDcre(new Date());
			workorder.setWkoDmod(new Date());
			workorder.setWkoExtToSync(true);
			
			WorkorderTaskStatus status = statusService.getStatus("CREE");
			workorder.setWtsId(status.getId());

			City city = cityRepository.findById(customWorkorderDto.getCtyId()).get();
			workorder.setCtyId(city.getId());
			workorder.setCtyLlabel(city.getCtyLlabel());

			workorder = workOrderRepository.saveAndFlush(workorder);

			// Get the work order asset
			for (CustomTaskDto taskDto : customWorkorderDto.getTasks()) {
				Asset asset = assetService.getAsset(taskDto.getAssObjRef(), taskDto.getAssObjTable(), account);

				try {
					Task task = new Task();
					task.setWkoId(workorder.getId());
					task.setTskName(workorder.getWkoName());
					task.setWtsId(workorder.getWtsId());
					task.setWtrId(taskDto.getWtrId());
					task.setTskComment(workorder.getWkoCreationComment());
					task.setCtrId(customWorkorderDto.getCtrId());
					task.setAssId(asset.getId());
					task.setTskPlanningStartDate(workorder.getWkoPlanningStartDate());
					task.setTskPlanningEndDate(workorder.getWkoPlanningEndDate());
					task.setTskUcreId(account.getId());
					task.setTskUmodId(account.getId());
					task.setTskDcre(new Date());
					task.setTskDmod(new Date());
					task.setLongitude(taskDto.getLongitude());
					task.setLatitude(taskDto.getLatitude());

					task = taskRepository.saveAndFlush(task);

					workOrderRepositoryImpl.updateGeomForTask(task.getId());

				} catch (Exception e) {
					throw new TechnicalException("Erreur lors de la sauvegarde de la tache pour l'utilisateur avec l'id  " + account.getId() + ".", e.getMessage());
				}
			}
			
			if(workorder.getLongitude() != null && workorder.getLatitude() != null) {
				workOrderRepositoryImpl.updateGeom(workorder.getId());
			}
			
		} catch (Exception e) {
			throw new TechnicalException("Erreur lors de la sauvegarde du workorder pour l'utilisateur avec l'id  " + account.getId() + ".", e.getMessage());
		}
		
		Workorder wko = workOrderRepository.findById(workorder.getId()).get();
		entityManager.refresh(wko);
		
    	return new CustomWorkorderDto(wko);
    }
    
    /**
     * Method to update a workorder
     * @param customWorkorderDto
     * @return the workorder dto
     */
    public CustomWorkorderDto updateWorkOrder(CustomWorkorderDto customWorkorderDto, AccountTokenDto account) {
    	
    	Workorder workorder = workOrderRepository.findById(customWorkorderDto.getId()).get();

		try {
	        workorder.setWkoCompletionDate(new Date());
	        workorder.setLongitude(customWorkorderDto.getLongitude());
	        workorder.setLatitude(customWorkorderDto.getLatitude());
			workorder.setWkoUmodId(account.getId());
			workorder.setWkoDmod(new Date());
			
			WorkorderTaskStatus status = statusService.getStatus("TERMINE");
			workorder.setWtsId(status.getId());

			workorder = workOrderRepository.save(workorder);

			// Get the work order asset
			for (CustomTaskDto taskDto : customWorkorderDto.getTasks()) {
				Asset asset = assetService.getAsset(taskDto.getAssObjRef(), taskDto.getAssObjTable(), account);

				try {
					Task task = taskRepository.findById(taskDto.getId()).get();
					task.setWtsId(workorder.getWtsId());
					task.setWtrId(taskDto.getWtrId());
					task.setAssId(asset.getId());
					task.setTskUmodId(account.getId());
					task.setTskDmod(new Date());
					task.setLongitude(taskDto.getLongitude());
					task.setLatitude(taskDto.getLatitude());
					
					if(taskDto.getReport() != null) {
						task.setTskReportDate(taskDto.getReport().getDateCompletion());
						for(ReportValueDto reportValue: taskDto.getReport().getReportValues()) {
							Report report = reportRepository.findByTskIdAndRptKey(taskDto.getId(), reportValue.getKey());
							if(report == null) {
								report = new Report();
								report.setRptKey(reportValue.getKey());
								report.setTskId(task.getId());
								report.setRptDcre(new Date());
								report.setRptUcreId(account.getId());
							}
							
							report.setRptLabel(reportValue.getQuestion());
							report.setRptValue(reportValue.getAnswer());
							report.setRptDmod(new Date());
							report.setRptUmodId(account.getId());
							report = reportRepository.save(report);
						}
					}

					task = taskRepository.save(task);

					workOrderRepositoryImpl.updateGeomForTask(task.getId());

				} catch (Exception e) {
					throw new TechnicalException("Erreur lors de la sauvegarde de la tache pour l'utilisateur avec l'id  " + account.getId() + ".", e.getMessage());
				}
			}
			
			if(workorder.getLongitude() != null && workorder.getLatitude() != null) {
				workOrderRepositoryImpl.updateGeom(workorder.getId());
			}
			
		} catch (Exception e) {
			throw new TechnicalException("Erreur lors de la sauvegarde du workorder pour l'utilisateur avec l'id  " + account.getId() + ".", e.getMessage());
		}
		
    	return customWorkorderDto;
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
	
	public CustomWorkorderDto getWorkOrderDto(Long id) {
		Workorder workOrder = workOrderRepository.findById(id).get();
		return new CustomWorkorderDto(workOrder);
	}
}
