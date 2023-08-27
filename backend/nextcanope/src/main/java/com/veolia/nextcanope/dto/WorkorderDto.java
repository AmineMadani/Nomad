package com.veolia.nextcanope.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.veolia.nextcanope.model.Task;
import com.veolia.nextcanope.model.Workorder;

public class WorkorderDto {

    private Long id;

    private String wkoName;

    private Boolean wkoEmergency;
    
    private Boolean wkoAppointment;

    private Long ctyId;

    private Long ctrId;

    private String wkoAddress;

    private Date wkoPlanningStartDate;

    private Date wkoPlanningEndDate;

    private Long wtsId;
    
    private Date wkoCompletionDate;
    
    private BigDecimal longitude;
    
    private BigDecimal latitude;
    
    private Integer wkoAgentNb;

    private String wkoCreationComment;
    
    private List<TaskDto> tasks;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getWkoName() {
        return wkoName;
    }

    public void setWkoName(String wkoName) {
        this.wkoName = wkoName;
    }

    public Boolean getWkoEmergency() {
        return wkoEmergency;
    }

    public void setWkoEmergency(Boolean wkoEmergency) { this.wkoEmergency = wkoEmergency; }

    public String getWkoAddress() {
        return wkoAddress;
    }

    public void setWkoAddress(String wkoAddress) {
        this.wkoAddress = wkoAddress;
    }

    public Date getWkoPlanningStartDate() {
        return wkoPlanningStartDate;
    }

    public void setWkoPlanningStartDate(Date wkoPlanningStartDate) {
        this.wkoPlanningStartDate = wkoPlanningStartDate;
    }

    public Date getWkoPlanningEndDate() {
        return wkoPlanningEndDate;
    }

    public void setWkoPlanningEndDate(Date wkoPlanningEndDate) {
        this.wkoPlanningEndDate = wkoPlanningEndDate;
    }

    public Long getWtsId() {
        return wtsId;
    }

    public void setWtsId(Long wtsId) {
        this.wtsId = wtsId;
    }

    public Date getWkoCompletionDate() {
        return wkoCompletionDate;
    }

    public void setWkoCompletionDate(Date wkoCompletionDate) {
        this.wkoCompletionDate = wkoCompletionDate;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public Integer getWkoAgentNb() {
        return wkoAgentNb;
    }

    public void setWkoAgentNb(Integer wkoAgentNb) {
        this.wkoAgentNb = wkoAgentNb;
    }

	public List<TaskDto> getTasks() {
		return tasks;
	}

	public void setTasks(List<TaskDto> tasks) {
		this.tasks = tasks;
	}

	public Boolean getWkoAppointment() {
		return wkoAppointment;
	}

	public void setWkoAppointment(Boolean wkoAppointment) {
		this.wkoAppointment = wkoAppointment;
	}

    public Long getCtrId() {
        return ctrId;
    }

    public void setCtrId(Long ctrId) {
        this.ctrId = ctrId;
    }

    public String getWkoCreationComment() {
        return wkoCreationComment;
    }

    public void setWkoCreationComment(String wkoCreationComment) {
        this.wkoCreationComment = wkoCreationComment;
    }

	public WorkorderDto() {
		super();
	}

    public Long getCtyId() {
        return ctyId;
    }

    public void setCtyId(Long ctyId) {
        this.ctyId = ctyId;
    }

	public WorkorderDto(Workorder workorder) {
        super();
        this.id = workorder.getId();
        this.wkoName = workorder.getWkoName();
        this.wkoEmergency = workorder.getWkoEmergency();
        this.wkoAppointment = workorder.getWkoAppointment();
        this.wkoAddress = workorder.getWkoAddress();
        this.wkoCreationComment = workorder.getWkoCreationComment();
        this.wkoPlanningStartDate = workorder.getWkoPlanningStartDate();
        this.wkoPlanningEndDate = workorder.getWkoPlanningEndDate();
        this.wkoCompletionDate = workorder.getWkoCompletionDate();
        this.wtsId = workorder.getWorkorderTaskStatus().getId();
        this.longitude = workorder.getLongitude();
        this.latitude = workorder.getLatitude();
        this.wkoAgentNb = workorder.getWkoAgentNb();
        this.ctyId = workorder.getCity().getId();
        this.tasks = new ArrayList<>();
        this.wkoCreationComment = workorder.getWkoCreationComment();
        for(Task task: workorder.getListOfTask()) {
        	this.tasks.add(new TaskDto(task));
            this.ctrId =this.tasks.get(0).getCtrId();
        }
    }
}
