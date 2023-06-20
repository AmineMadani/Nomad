package com.veolia.nextcanope.dto;

import java.math.BigDecimal;
import java.util.Date;

import com.veolia.nextcanope.model.Workorder;

public class WorkorderDto {

    private Long id;

    private String wkoName;

    private Boolean wkoEmergency;

    private String wkoAddress ;

    private Date wkoPlanningStartDate ;

    private Date wkoPlanningEndDate ;

    private Long wtsId ;

    private Long wtrId ;

    private Long assId;

    private Date wkoCompletionDate;

    private String wkoRealizationCell;

    private BigDecimal longitude ;

    private BigDecimal latitude ;

    private Integer wkoAgentNb ;

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

    public Long getAssId() {
        return assId;
    }

    public void setAssId(Long assId) {
        this.assId = assId;
    }

    public Long getWtsId() {
        return wtsId;
    }

    public void setWtsId(Long wtsId) {
        this.wtsId = wtsId;
    }

    public Long getWtrId() {
        return wtrId;
    }

    public void setWtrId(Long wtrId) {
        this.wtrId = wtrId;
    }

    public Date getWkoCompletionDate() {
        return wkoCompletionDate;
    }

    public void setWkoCompletionDate(Date wkoCompletionDate) {
        this.wkoCompletionDate = wkoCompletionDate;
    }

    public String getWkoRealizationCell() {
        return wkoRealizationCell;
    }

    public void setWkoRealizationCell(String wkoRealizationCell) {
        this.wkoRealizationCell = wkoRealizationCell;
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

    public WorkorderDto(Workorder workorder) {
        super();
        this.id = workorder.getId();
        this.assId = workorder.getAssId();
        this.wtsId = workorder.getWtsId();
        this.wtrId = workorder.getWtrId();
        this.wkoName = workorder.getWkoName();
        this.wkoEmergency = workorder.getWkoEmergency();
        this.wkoAddress = workorder.getWkoAddress();
        this.wkoPlanningStartDate = workorder.getWkoPlanningStartDate();
        this.wkoPlanningEndDate = workorder.getWkoPlanningEndDate();
        this.wkoCompletionDate = workorder.getWkoCompletionDate();
        this.wkoRealizationCell = workorder.getWkoRealizationCell();
        this.longitude = workorder.getLongitude();
        this.latitude = workorder.getLatitude();
        this.wkoAgentNb = workorder.getWkoAgentNb();
    }
}
