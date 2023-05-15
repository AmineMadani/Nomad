package com.veolia.nextcanope.dto;

import java.math.BigDecimal;
import java.util.Date;

import com.veolia.nextcanope.model.Workorder;

public class WorkOrderDto {

	private Long id;

    private String reason;

    private String status;

    private Date datebegin;

    private Date dateend;

    private Boolean urgent;

    private Boolean appointment;

    private BigDecimal x;

    private BigDecimal y;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getReason() {
		return reason;
	}

	public void setReason(String reason) {
		this.reason = reason;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Date getDatebegin() {
		return datebegin;
	}

	public void setDatebegin(Date datebegin) {
		this.datebegin = datebegin;
	}

	public Date getDateend() {
		return dateend;
	}

	public void setDateend(Date dateend) {
		this.dateend = dateend;
	}

	public Boolean getUrgent() {
		return urgent;
	}

	public void setUrgent(Boolean urgent) {
		this.urgent = urgent;
	}

	public Boolean getAppointment() {
		return appointment;
	}

	public void setAppointment(Boolean appointment) {
		this.appointment = appointment;
	}

	public BigDecimal getX() {
		return x;
	}

	public void setX(BigDecimal x) {
		this.x = x;
	}

	public BigDecimal getY() {
		return y;
	}

	public void setY(BigDecimal y) {
		this.y = y;
	}

	public WorkOrderDto(Workorder workOrderEntity) {
		super();
		this.id=workOrderEntity.getId();
	    this.reason=workOrderEntity.getWkoName();
	    this.status=workOrderEntity.getWorkorderTaskStatus().getWtsCode();
	    this.datebegin=workOrderEntity.getWkoPlanningStartDate();
	    this.dateend=workOrderEntity.getWkoPlanningStartDate();
	    this.urgent=workOrderEntity.getWkoEmergency();
	    this.appointment=workOrderEntity.getWkoAppointment();
	    this.x=workOrderEntity.getLongitude();
	    this.y=workOrderEntity.getLatitude();
	}
}
