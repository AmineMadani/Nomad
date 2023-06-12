package com.veolia.nomad.batch.workordermoveobatch.model;

import java.util.Date;

public class MoveoOrdreIntervention {
	
	private Long id;
	
	private String codemvt;

	private String origine;
	
	private String type;
	
	private Integer motif;
	
	private String codeContrat;
	
	private String codeEqpt;
	
	private String nom;
	
	private String adresse;
	
	private String refExterneDI;
	
	private Date dateDebut;
	
	private Date dateFin;
	
	private Double coordX;
	
	private Double coordY;
	
	private String commune;
	
	private String commentaires;
	
	private Integer duree;
	
	private String typeDemande;
	
	private Integer nbAgent;
	
	private String codeCommuneInsee;
	
	private String urgence;
	
	private String wkoStatus;
	
	public MoveoOrdreIntervention() {
	}
	
	public MoveoOrdreIntervention(WorkOrder workorder) {
		id = workorder.getId();
		codemvt = workorder.getCodeMvt();
		origine = workorder.getOrigin();
		type = workorder.getType();
		motif = Integer.parseInt(workorder.getReason());
		codeContrat = workorder.getContractCode();
		codeEqpt = workorder.getAssetId() != null ? workorder.getAssetId() : "";
		nom = workorder.getLyrTableName().equals("xy") ? "SANS PATRIMOINE ASSOCIE" : workorder.getLyrTableName();
		adresse = workorder.getStreet();
		refExterneDI = workorder.getId().toString();
		dateDebut = workorder.getPlanningStartDate();
		dateFin = workorder.getPlanningEndDate();
		coordX = workorder.getLongitude();
		coordY = workorder.getLatitude();
		commune = workorder.getCity();
		commentaires = workorder.getCreationComment();
		duree = workorder.getDuration();
		typeDemande = workorder.isAppointment() ? "R" : "D";
		urgence = workorder.isEmergency() ? "O" : "N";
		nbAgent = workorder.getNbAgent();
		codeCommuneInsee = workorder.getInseeCode();
		wkoStatus = workorder.getStatus();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getCodemvt() {
		return codemvt;
	}

	public void setCodemvt(String codemvt) {
		this.codemvt = codemvt;
	}

	public String getOrigine() {
		return origine;
	}

	public void setOrigine(String origine) {
		this.origine = origine;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public Integer getMotif() {
		return motif;
	}

	public void setMotif(Integer motif) {
		this.motif = motif;
	}

	public String getCodeContrat() {
		return codeContrat;
	}

	public void setCodeContrat(String codeContrat) {
		this.codeContrat = codeContrat;
	}

	public String getCodeEqpt() {
		return codeEqpt;
	}

	public void setCodeEqpt(String codeEqpt) {
		this.codeEqpt = codeEqpt;
	}

	public String getNom() {
		return nom;
	}

	public void setNom(String nom) {
		this.nom = nom;
	}

	public String getAdresse() {
		return adresse;
	}

	public void setAdresse(String adresse) {
		this.adresse = adresse;
	}

	public String getRefExterneDI() {
		return refExterneDI;
	}

	public void setRefExterneDI(String refExterneDI) {
		this.refExterneDI = refExterneDI;
	}
	
	public Date getDateDebut() {
		return dateDebut;
	}

	public void setDateDebut(Date dateDebut) {
		this.dateDebut = dateDebut;
	}

	public Date getDateFin() {
		return dateFin;
	}

	public void setDateFin(Date dateFin) {
		this.dateFin = dateFin;
	}

	public Double getCoordX() {
		return coordX;
	}

	public void setCoordX(Double coordX) {
		this.coordX = coordX;
	}

	public Double getCoordY() {
		return coordY;
	}

	public void setCoordY(Double coordY) {
		this.coordY = coordY;
	}

	public String getCommune() {
		return commune;
	}

	public void setCommune(String commune) {
		this.commune = commune;
	}

	public String getCommentaires() {
		return commentaires;
	}

	public void setCommentaires(String commentaires) {
		this.commentaires = commentaires;
	}

	public Integer getDuree() {
		return duree;
	}

	public void setDuree(Integer duree) {
		this.duree = duree;
	}

	public String getTypeDemande() {
		return typeDemande;
	}

	public void setTypeDemande(String typeDemande) {
		this.typeDemande = typeDemande;
	}

	public Integer getNbAgent() {
		return nbAgent;
	}

	public void setNbAgent(Integer nbAgent) {
		this.nbAgent = nbAgent;
	}

	public String getCodeCommuneInsee() {
		return codeCommuneInsee;
	}

	public void setCodeCommuneInsee(String codeCommuneInsee) {
		this.codeCommuneInsee = codeCommuneInsee;
	}

	public String getUrgence() {
		return urgence;
	}

	public void setUrgence(String urgence) {
		this.urgence = urgence;
	}

	public String getWkoStatus() {
		return wkoStatus;
	}

	public void setWkoStatus(String wkoStatus) {
		this.wkoStatus = wkoStatus;
	}
	
}
