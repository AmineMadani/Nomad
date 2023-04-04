package com.veolia.nextcanope.dto;

import java.math.BigDecimal;
import java.util.Date;

import com.veolia.nextcanope.model.Intervention;

public class InterventionDto {

	private Integer id;

    private String reason;

    private String status;

    private Date datebegin;

    private Date dateend;

    private Boolean urgent;

    private Boolean appointment;

    private BigDecimal x;

    private BigDecimal y;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
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

	public InterventionDto(Intervention interventionEntity) {
		super();
		this.id=interventionEntity.getId();
	    this.reason=interventionEntity.getReason();
	    this.status=interventionEntity.getStatus();
	    this.datebegin=interventionEntity.getDatebegin();
	    this.dateend=interventionEntity.getDateend();
	    this.urgent=interventionEntity.getUrgent();
	    this.appointment=interventionEntity.getAppointment();
	    this.x=interventionEntity.getX();
	    this.y=interventionEntity.getY();
	}
}
