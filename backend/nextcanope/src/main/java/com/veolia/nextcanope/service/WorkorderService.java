package com.veolia.nextcanope.service;

import java.util.*;

import com.veolia.nextcanope.dto.*;
import com.veolia.nextcanope.dto.payload.CancelWorkorderPayload;
import com.veolia.nextcanope.enums.WorkOrderStatusCode;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.model.*;
import com.veolia.nextcanope.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.exception.TechnicalException;

/**
 * WorkOrderService is a service class for managing workorder-related data.
 * It interacts with the WorkOrderRepository to access and manipulate the data.
 */
@Service
public class WorkorderService {

    @Autowired
    private WorkorderRepositoryImpl workOrderRepositoryImpl;
    
    @Autowired
    private WorkorderRepository workOrderRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private ReportRepository reportRepository;

	@Autowired
	private WorkOrderTaskReasonRepository workOrderTaskReasonRepository;
    
    @Autowired 
    private AssetService assetService;
    
    @Autowired 
    private CityService cityService;
    
    @Autowired
    private StatusService statusService;

	@Autowired
	private UserService userService;

	@Autowired
	private ContractService contractService;

	@Autowired
	private WorkOrderTaskStatusRepository workOrderTaskStatusRepository;


	public Workorder getWorkOrderById(Long id) {
		return workOrderRepository.findById(id).orElseThrow(() -> new FunctionalException("L'intervention avec l'id " + id + " n'existe pas."));
	}

	public WorkorderDto getWorkOrderDtoById(Long id) {
		Workorder workOrder = getWorkOrderById(id);
		return new WorkorderDto(workOrder);
	}

    /**
	 * Retrieve the list of workorders by most recent date planned limited in number with offset for pagination
	 * @param limit The number of workorder to get
	 * @param offset The pagination offset to set
     * @param searchParameter The search parameters
	 * @return the workorder list
	 */
    public List<TaskSearchDto> getWorkOrdersWithOffsetOrderByMostRecentDateBegin(Long limit, Long offset, HashMap<String, String[]> searchParameter) {
		return workOrderRepositoryImpl.getWorkOrderPaginationWithCustomCriteria(limit, offset, searchParameter);
    }

	/**
	 * Retrieve the workorders associated with an asset given by his id and his table
	 * @param assetObjRef Id of the asset
	 * @param assetObjTable Name of the table asset
	 * @return list of workorders DTO
	 */
	public List<WorkorderDto> getEquipmentWorkOrderHistory(String assetObjTable, String assetObjRef) {
		List<WorkorderDto> workordersDto = new ArrayList<>();
		List<Workorder> workorders = workOrderRepository.getWorkordersLinkToEquipment(assetObjTable, assetObjRef);
		for(Workorder workorder:workorders) {
			workordersDto.add(new WorkorderDto(workorder));
		}
		return workordersDto;
	}

	public WorkorderTaskReason getWorkOrderTaskReasonById(Long wtrId) {
		return this.workOrderTaskReasonRepository.findById(wtrId)
				.orElseThrow(() -> new FunctionalException("La raison avec l'id " + wtrId + " n'existe pas."));
	}

	public Task getTaskById(Long taskId) {
		return this.taskRepository.findById(taskId)
				.orElseThrow(() -> new FunctionalException("La tâche avec l'id " + taskId + " n'existe pas."));
	}
    
    /**
     * Method which permit to create a workorder
     * @param customWorkorderDto the payload
     * @param userId the user id who create the work order
     * @return the work order dto
     */
    public WorkorderDto createWorkOrder(WorkorderDto customWorkorderDto, Long userId) {
		Users user = this.userService.getUserById(userId);
		
		Workorder workorder = new Workorder();
		
		//If we received a negative id, we are in the case of a workorder that was already send by the mobile 
		//but not sync with it maybe cause by a network issue
		if(customWorkorderDto.getId() != null && customWorkorderDto.getId() < 0) {
			Workorder localWorkorder = workOrderRepository.findByWkoCacheId(customWorkorderDto.getId());
			//If the workorder is find we return it
			if(localWorkorder != null) {
				return new WorkorderDto(localWorkorder);
			} else {
				//if not we set the negative id on the creation
				workorder.setWkoCacheId(customWorkorderDto.getId());
			}
		}

		workorder.setWkoName(customWorkorderDto.getWkoName());
		workorder.setWkoEmergency(customWorkorderDto.getWkoEmergency());
		workorder.setWkoAppointment(customWorkorderDto.getWkoAppointment());
		workorder.setWkoAddress(customWorkorderDto.getWkoAddress());
		workorder.setWkoPlanningStartDate(customWorkorderDto.getWkoPlanningStartDate());
		workorder.setWkoPlanningEndDate(customWorkorderDto.getWkoPlanningEndDate());
		workorder.setWkoCompletionDate(customWorkorderDto.getWkoCompletionDate());
		workorder.setLongitude(customWorkorderDto.getLongitude());
		workorder.setLatitude(customWorkorderDto.getLatitude());
		workorder.setWkoCreationComment(customWorkorderDto.getWkoCreationComment());
		workorder.setWkoAgentNb(customWorkorderDto.getWkoAgentNb());
		workorder.setWkoAttachment(customWorkorderDto.getWkoAttachment());
		workorder.setCreatedBy(user);
		workorder.setModifiedBy(user);
		
		if(customWorkorderDto.getId() != null && customWorkorderDto.getTasks().get(0).getReport() == null) {
			workorder.setWkoExtToSync(true);
		} else {
			workorder.setWkoExtToSync(customWorkorderDto.getWkoExtToSync());
		}

		WorkorderTaskStatus status = statusService.getStatus(WorkOrderStatusCode.CREE.toString());
		if(customWorkorderDto.getId() != null && customWorkorderDto.getId() < 0 && customWorkorderDto.getTasks().get(0).getReport() != null) {
			status = statusService.getStatus(WorkOrderStatusCode.TERMINE.toString());
		}
		workorder.setWorkorderTaskStatus(status);

		if(customWorkorderDto.getCtyId() != null) {
			City city = cityService.getCityById(customWorkorderDto.getCtyId());
			workorder.setCity(city);
			workorder.setCtyLlabel(city.getCtyLlabel());
		}

		List<Task> tasks = new ArrayList<>();
		for (TaskDto taskDto : customWorkorderDto.getTasks()) {
			Task task = new Task();

			// Set task attributes
			task.setWorkorder(workorder);
			task.setTskName(workorder.getWkoName());
			task.setWorkorderTaskStatus(workorder.getWorkorderTaskStatus());
			task.setTskComment(workorder.getWkoCreationComment());
			task.setTskPlanningStartDate(workorder.getWkoPlanningStartDate());
			task.setTskPlanningEndDate(workorder.getWkoPlanningEndDate());
			task.setCreatedBy(user);
			task.setModifiedBy(user);
			task.setLongitude(taskDto.getLongitude());
			task.setLatitude(taskDto.getLatitude());
			// Get or create asset
			Asset asset = assetService.getNewOrExistingAsset(taskDto.getAssObjRef(), taskDto.getAssObjTable(), userId);
			task.setAsset(asset);
			// Get Reason
			WorkorderTaskReason wtr = getWorkOrderTaskReasonById(taskDto.getWtrId());
			task.setWorkorderTaskReason(wtr);
			// Get Contract
			if(customWorkorderDto.getCtrId() != null) {
				Contract contract = contractService.getContractById(customWorkorderDto.getCtrId());
				task.setContract(contract);
			}
			
			// Set report
			List<Report> reports = new ArrayList<>();
			if (taskDto.getReport() != null) {
				task.setTskReportDate(taskDto.getReport().getDateCompletion());
				for (ReportValueDto reportValue : taskDto.getReport().getReportValues()) {
					Report report = reportRepository.findByTask_IdAndRptKey(taskDto.getId(), reportValue.getKey());
					if (report == null) {
						report = new Report();
						report.setRptKey(reportValue.getKey());
						report.setTask(task);
						report.setCreatedBy(user);
					}
					report.setRptLabel(reportValue.getQuestion());
					report.setRptValue(reportValue.getAnswer());
					report.setModifiedBy(user);
					reports.add(report);
				}
			}
			task.setListOfReport(reports);

			tasks.add(task);
		}
		workorder.setListOfTask(tasks);

		try {
			workorder = workOrderRepository.save(workorder);
		} catch (Exception e) {
			throw new TechnicalException("Erreur lors de la sauvegarde du workorder pour l'utilisateur avec l'id  " + userId + ".", e.getMessage());
		}

		return new WorkorderDto(workorder);
    }

	/**
	 * Method which permit to update data of workorder
	 * @param customWorkorderDto the payload
	 * @param userId the user id who update the work order
	 * @return the work order dto
	 */
	public WorkorderDto updateWorkOrder(
			Long wkoId,
			WorkorderDto customWorkorderDto,
			Long userId
	) {

		Users user = this.userService.getUserById(userId);
		
		//If we received a negative id, we are in the case of a workorder that was already send by the mobile 
		//but not sync with it maybe cause by a network issue
		if(customWorkorderDto.getId() < 0) {
			Workorder localWorkorder = workOrderRepository.findByWkoCacheId(customWorkorderDto.getId());
			if(localWorkorder != null) {
				if(localWorkorder.getWkoDmod() != null && localWorkorder.getWkoDmod().compareTo(customWorkorderDto.getWkoDmod()) > 0) {
					return new WorkorderDto(localWorkorder);
				} else {
					customWorkorderDto.setId(localWorkorder.getId());
				}
			}
		}

		Workorder workorder = getWorkOrderById(wkoId);
		workorder.setWkoName(customWorkorderDto.getWkoName());
		workorder.setWkoEmergency(customWorkorderDto.getWkoEmergency());
		workorder.setWkoAppointment(customWorkorderDto.getWkoAppointment());
		workorder.setWkoAddress(customWorkorderDto.getWkoAddress());
		workorder.setWkoPlanningStartDate(customWorkorderDto.getWkoPlanningStartDate());
		workorder.setWkoPlanningEndDate(customWorkorderDto.getWkoPlanningEndDate());
		workorder.setLongitude(customWorkorderDto.getLongitude());
		workorder.setLatitude(customWorkorderDto.getLatitude());
		workorder.setWkoCreationComment(customWorkorderDto.getWkoCreationComment());
		workorder.setWkoAgentNb(customWorkorderDto.getWkoAgentNb());
		workorder.setWkoAttachment(customWorkorderDto.getWkoAttachment());
		workorder.setModifiedBy(user);
		WorkorderTaskStatus status = statusService.getStatus(WorkOrderStatusCode.CREE.toString());
		workorder.setWorkorderTaskStatus(status);

		City city = cityService.getCityById(customWorkorderDto.getCtyId());
		workorder.setCity(city);
		workorder.setCtyLlabel(city.getCtyLlabel());
		workorder.setWkoExtToSync(customWorkorderDto.getWkoExtToSync());
		List<Task> existingTasks = workorder.getListOfTask();
		List<Task> newTasks = new ArrayList<>();
		for (TaskDto taskDto : customWorkorderDto.getTasks()) {
			Task task = new Task();
			Long taskId = taskDto.getId();
			if (taskId  != null){
				if(taskId < 0) {
					task = taskRepository.findByTskCacheId(taskId);
					if(task == null) {
						task = new Task();
					}
				} else {
					task = getTaskById(taskId);
				}
			}
			// Set task attributes
			task.setWorkorder(workorder);
			task.setTskName(workorder.getWkoName());
			task.setWorkorderTaskStatus(workorder.getWorkorderTaskStatus());
			task.setTskComment(workorder.getWkoCreationComment());
			task.setTskPlanningStartDate(workorder.getWkoPlanningStartDate());
			task.setTskPlanningEndDate(workorder.getWkoPlanningEndDate());
			task.setCreatedBy(user);
			task.setModifiedBy(user);
			task.setLongitude(taskDto.getLongitude());
			task.setLatitude(taskDto.getLatitude());
			// Get or create asset
			Asset asset = assetService.getNewOrExistingAsset(taskDto.getAssObjRef(), taskDto.getAssObjTable(), userId);
			task.setAsset(asset);
			// Get Reason
			WorkorderTaskReason wtr = getWorkOrderTaskReasonById(taskDto.getWtrId());
			task.setWorkorderTaskReason(wtr);
			// Get Contract
			Contract contract = contractService.getContractById(customWorkorderDto.getCtrId());
			task.setContract(contract);

			newTasks.add(task);
		}
		//Gestion des task à supprimer
		List<String> objRef = customWorkorderDto.getTasks().stream()
				.map(TaskDto::getAssObjRef)
				.toList();
		for(Task existingTask : existingTasks){
			if (!objRef.contains(existingTask.getAsset().getAssObjRef())){
				existingTask.markAsDeleted(user);
				newTasks.add((existingTask));
			}
		}
		workorder.setListOfTask(newTasks);

		try {
			workorder = workOrderRepository.save(workorder);
		} catch (Exception e) {
			throw new TechnicalException("Erreur lors de la sauvegarde du workorder pour l'utilisateur avec l'id  " + userId + ".", e.getMessage());
		}

		return new WorkorderDto(workorder);
	}

	/**
	 * Method which permit to terminate a workorder
	 * @param customWorkorderDto the payload
	 * @param userId the user id who update the work order
	 * @return the work order dto
	 */
    public WorkorderDto terminateWorkOrder(
			Long wkoId,
			WorkorderDto customWorkorderDto,
			Long userId
	) {
		Users user = userService.getUserById(userId);

		Workorder workorder = getWorkOrderById(wkoId);
		if (customWorkorderDto.getWkoCompletionDate() != null) {
			workorder.setWkoCompletionDate(customWorkorderDto.getWkoCompletionDate());
		} else {
			workorder.setWkoCompletionDate(new Date());
		}
		workorder.setWkoCompletionStartDate(customWorkorderDto.getWkoCompletionStartDate());
		workorder.setLongitude(customWorkorderDto.getLongitude());
		workorder.setLatitude(customWorkorderDto.getLatitude());
		workorder.setModifiedBy(user);

		WorkorderTaskStatus status = statusService.getStatus(WorkOrderStatusCode.TERMINE.toString());
		workorder.setWorkorderTaskStatus(status);

		// Get the work order asset
		for (TaskDto taskDto : customWorkorderDto.getTasks()) {
			Task task = getTaskById(taskDto.getId());

			// Set task attributes
			task.setWorkorderTaskStatus(workorder.getWorkorderTaskStatus());
			task.setModifiedBy(user);
			task.setLongitude(taskDto.getLongitude());
			task.setLatitude(taskDto.getLatitude());
			// Set report
			List<Report> reports = new ArrayList<>();
			if (taskDto.getReport() != null) {
				task.setTskReportDate(taskDto.getReport().getDateCompletion());
				for (ReportValueDto reportValue: taskDto.getReport().getReportValues()) {
					Report report = reportRepository.findByTask_IdAndRptKey(taskDto.getId(), reportValue.getKey());
					if (report == null) {
						report = new Report();
						report.setRptKey(reportValue.getKey());
						report.setTask(task);
						report.setCreatedBy(user);
					}
					report.setRptLabel(reportValue.getQuestion());
					report.setRptValue(reportValue.getAnswer());
					report.setModifiedBy(user);
					reports.add(report);
				}
			}
			task.setListOfReport(reports);
			// Set asset
			Asset asset = assetService.getNewOrExistingAsset(taskDto.getAssObjRef(), taskDto.getAssObjTable(), userId);
			task.setAsset(asset);
			// Set reason
			WorkorderTaskReason wtr = this.getWorkOrderTaskReasonById(taskDto.getWtrId());
			task.setWorkorderTaskReason(wtr);
		}

		try {
			workorder = workOrderRepository.save(workorder);
		} catch (Exception e) {
			throw new TechnicalException("Erreur lors de la sauvegarde du workorder pour l'utilisateur avec l'id  " + userId + ".", e.getMessage());
		}

		return new WorkorderDto(workorder);
    }

	/**
	 * Method to cancel a workorder and all associated tasks
	 * @return message returned to front
	 */
	public WorkorderDto cancelWorkOrder(
			Long wkoId,
			CancelWorkorderPayload cancelWorkorderPayload,
			Long userId
	) {
		Users user = userService.getUserById(userId);

		Workorder workorder = getWorkOrderById(wkoId);

		WorkorderTaskStatus oldStatus = statusService.getStatus(workorder.getWorkorderTaskStatus().getId());
		WorkorderTaskStatus newStatus = statusService.getStatus(WorkOrderStatusCode.ANNULE.toString());
		workorder.setWorkorderTaskStatus(newStatus);
		workorder.setWkoCancelComment(cancelWorkorderPayload.getCancelComment());
		workorder.setModifiedBy(user);

		for (Task task : workorder.getListOfTask()) {
			task.setWorkorderTaskStatus(newStatus);
		}

		if (oldStatus.getWtsCode().equals(WorkOrderStatusCode.ENVOYEPLANIF.toString())) {
			workorder.setWkoExtToSync(true);
		}

		workorder = workOrderRepository.save(workorder);

		return new WorkorderDto(workorder);
	}

    public List<WorkorderTaskStatusDto> getAllWorkorderTaskStatus() {
		return this.workOrderTaskStatusRepository.getAllWorkorderTaskStatus();
    }

	public List<WorkorderTaskReasonDto> getAllWorkorderTaskReasons() {
		return this.workOrderTaskReasonRepository.getAllWorkorderTaskReasons();
	}
}
