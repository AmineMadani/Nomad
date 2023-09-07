package com.veolia.nextcanope.dto;

import java.math.BigDecimal;
import java.util.Date;

public class TaskSearchDto {

    private Long id;

    private Long wkoId;

    private String wkoName;

    private Boolean wkoEmergency;
    
    private Boolean wkoAppointment;

    private Long ctyId;

    private Long ctrId;

    private String wkoAddress;

    private Date wkoPlanningStartDate;

    private Date wkoPlanningEndDate;

    private Long wtsId;

    private Date wkoCompletionStartDate;
    
    private Date wkoCompletionEndDate;
    
    private BigDecimal longitude;
    
    private BigDecimal latitude;
    
    private Integer wkoAgentNb;

    private String wkoCreationComment;

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

    public Date getWkoCompletionStartDate() {
        return wkoCompletionStartDate;
    }

    public void setWkoCompletionStartDate(Date wkoCompletionStartDate) {
        this.wkoCompletionStartDate = wkoCompletionStartDate;
    }

    public Date getWkoCompletionEndDate() {
        return wkoCompletionEndDate;
    }

    public void setWkoCompletionEndDate(Date wkoCompletionDate) {
        this.wkoCompletionEndDate = wkoCompletionDate;
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

	public TaskSearchDto() {
		super();
	}

    public Long getCtyId() {
        return ctyId;
    }

    public void setCtyId(Long ctyId) {
        this.ctyId = ctyId;
    }

	public Long getWkoId() {
		return wkoId;
	}

	public void setWkoId(Long wkoId) {
		this.wkoId = wkoId;
	}
}
