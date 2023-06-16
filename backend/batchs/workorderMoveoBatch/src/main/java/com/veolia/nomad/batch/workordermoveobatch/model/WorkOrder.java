package com.veolia.nomad.batch.workordermoveobatch.model;

import java.util.Date;

public class WorkOrder {
	
	private String codeMvt;
	
	private String origin;
	
	private String type;
	
	private String status;
	
	private String reason;
	
	private String street;
	
	private String postalCode;
	
	private String city;
	
	private Long id;
	
	private Date planningStartDate;
	
	private Date planningEndDate;
	
	private Integer duration;
	
	private String creationComment;
	
	private boolean appointment;
	
	private boolean emergency;
	
	private String inseeCode;
	
	private String contractCode;
	
	private String worksiteCode;
	
	private String name;
	
	private String lyrTableName;
	
	private String assetId;
	
	private Double latitude;
	
	private Double longitude;
	
	private Integer nbAgent;

	public String getLyrTableName() {
		return lyrTableName;
	}

	public String getCodeMvt() {
		return codeMvt;
	}

	public void setCodeMvt(String codeMvt) {
		this.codeMvt = codeMvt;
	}

	public String getOrigin() {
		return origin;
	}

	public void setOrigin(String origin) {
		this.origin = origin;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getReason() {
		return reason;
	}

	public void setReason(String reason) {
		this.reason = reason;
	}

	public String getStreet() {
		return street;
	}

	public void setStreet(String street) {
		this.street = street;
	}

	public String getPostalCode() {
		return postalCode;
	}

	public void setPostalCode(String postalCode) {
		this.postalCode = postalCode;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Date getPlanningStartDate() {
		return planningStartDate;
	}

	public void setPlanningStartDate(Date planningStartDate) {
		this.planningStartDate = planningStartDate;
	}

	public Date getPlanningEndDate() {
		return planningEndDate;
	}

	public void setPlanningEndDate(Date planningEndDate) {
		this.planningEndDate = planningEndDate;
	}

	public Integer getDuration() {
		return duration;
	}

	public void setDuration(Integer duration) {
		this.duration = duration;
	}

	public String getCreationComment() {
		return creationComment;
	}

	public void setCreationComment(String creationComment) {
		this.creationComment = creationComment;
	}

	public boolean isAppointment() {
		return appointment;
	}

	public void setAppointment(boolean appointment) {
		this.appointment = appointment;
	}

	public boolean isEmergency() {
		return emergency;
	}

	public void setEmergency(boolean emergency) {
		this.emergency = emergency;
	}

	public String getInseeCode() {
		return inseeCode;
	}

	public void setInseeCode(String inseeCode) {
		this.inseeCode = inseeCode;
	}

	public String getContractCode() {
		return contractCode;
	}

	public void setContractCode(String contractCode) {
		this.contractCode = contractCode;
	}

	public String getWorksiteCode() {
		return worksiteCode;
	}

	public void setWorksiteCode(String worksiteCode) {
		this.worksiteCode = worksiteCode;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getAssetId() {
		return assetId;
	}

	public void setAssetId(String assetId) {
		this.assetId = assetId;
	}

	public Double getLatitude() {
		return latitude;
	}

	public void setLatitude(Double latitude) {
		this.latitude = latitude;
	}

	public Double getLongitude() {
		return longitude;
	}

	public void setLongitude(Double longitude) {
		this.longitude = longitude;
	}

	public void setLyrTableName(String lyrTableName) {
		this.lyrTableName = lyrTableName;
	}

	public Integer getNbAgent() {
		return nbAgent;
	}

	public void setNbAgent(Integer nbAgent) {
		this.nbAgent = nbAgent;
	}
	
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public WorkOrder() {
		super();
	}
}
