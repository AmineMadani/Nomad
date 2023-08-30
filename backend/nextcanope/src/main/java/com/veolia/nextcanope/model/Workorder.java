/*
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import jakarta.persistence.*;
import java.util.stream.Collectors;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.CreationTimestamp;
import org.locationtech.jts.geom.Geometry;


/**
 * JPA entity class for "Workorder"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="workorder", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class Workorder implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY ---\\
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id;

    //--- ENTITY DATA FIELDS ---\\
    @Column(name="wko_name", length=2147483647)
    @JsonProperty("wko_name")
    private String wkoName;

    @Column(name="wko_external_app", length=2147483647)
    @JsonProperty("wko_external_app")
    private String wkoExternalApp;

    @Column(name="wko_external_id", length=2147483647)
    @JsonProperty("wko_external_id")
    private String wkoExternalId;

    @Column(name="wko_creation_cell", length=2147483647)
    @JsonProperty("wko_creation_cell")
    private String wkoCreationCell;

    @Column(name="wko_creation_comment", length=2147483647)
    @JsonProperty("wko_creation_comment")
    private String wkoCreationComment;

    @Column(name="wko_emergency")
    @JsonProperty("wko_emergency")
    private Boolean wkoEmergency;

    @Column(name="wko_appointment")
    @JsonProperty("wko_appointment")
    private Boolean wkoAppointment;

    @Column(name="wko_address", length=2147483647)
    @JsonProperty("wko_address")
    private String wkoAddress;

    @Column(name="wko_street_number", length=2147483647)
    @JsonProperty("wko_street_number")
    private String wkoStreetNumber;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_planning_start_date")
    @JsonProperty("wko_planning_start_date")
    private Date wkoPlanningStartDate;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_planning_end_date")
    @JsonProperty("wko_planning_end_date")
    private Date wkoPlanningEndDate;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_completion_date")
    @JsonProperty("wko_completion_date")
    private Date wkoCompletionDate;

    @Column(name="wko_realization_user", length=2147483647)
    @JsonProperty("wko_realization_user")
    private String wkoRealizationUser;

    @Column(name="wko_realization_cell", length=2147483647)
    @JsonProperty("wko_realization_cell")
    private String wkoRealizationCell;

    @Column(name="wko_realization_comment", length=2147483647)
    @JsonProperty("wko_realization_comment")
    private String wkoRealizationComment;

    @Column(name="wko_cancel_comment", length=2147483647)
    @JsonProperty("wko_cancel_comment")
    private String wkoCancelComment;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_dmod")
    @UpdateTimestamp
    @JsonProperty("wko_dmod")
    private Date wkoDmod;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_dcre")
    @CreationTimestamp
    @JsonProperty("wko_dcre")
    private Date wkoDcre;

    @Column(name="cty_llabel", length=2147483647)
    @JsonProperty("cty_llabel")
    private String ctyLlabel;

    @Column(name="str_llabel", length=2147483647)
    @JsonProperty("str_llabel")
    private String strLlabel;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_ddel")
    @JsonProperty("wko_ddel")
    private Date deletedAt;

    @Column(name="longitude")
    @JsonProperty("longitude")
    private BigDecimal longitude;

    @Column(name="latitude")
    @JsonProperty("latitude")
    private BigDecimal latitude;

    @Column(name="geom", length=2147483647)
	@JsonProperty("geom")
    private Geometry geom;
    @Column(name="wko_agent_nb")
    @JsonProperty("wko_agent_nb")
    private Integer wkoAgentNb;

    @Column(name="wko_ext_ref", length=2147483647)
    @JsonProperty("wko_ext_ref")
    private String wkoExtRef;

    @Temporal(TemporalType.DATE)
    @Column(name="wko_ext_date_sync")
    @JsonProperty("wko_ext_date_sync")
    private Date wkoExtDateSync;

    @Column(name="wko_ext_to_sync", nullable=false)
    @JsonProperty("wko_ext_to_sync")
    private Boolean wkoExtToSync;

    @Column(name="wko_ext_error", length=2147483647)
    @JsonProperty("wko_ext_error")
    private String wkoExtError;

    @Column(name="wko_attachment")
    @JsonProperty("wko_attachment")
    private Boolean wkoAttachment;


    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="wko_umod_id", referencedColumnName="id")
	@JsonIgnore
    private Users modifiedBy;

    @OneToMany(cascade = { CascadeType.MERGE, CascadeType.PERSIST }, mappedBy="workorder")
    private List<Task> listOfTask;

    @ManyToOne
    @JoinColumn(name="wts_id", referencedColumnName="id")
    private WorkorderTaskStatus workorderTaskStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="wko_ucre_id", referencedColumnName="id")
	@JsonIgnore
    private Users createdBy;

    @ManyToOne
    @JoinColumn(name="str_id", referencedColumnName="id")
    private Street street;

    @ManyToOne
    @JoinColumn(name="cty_id", referencedColumnName="id")
    private City city;

    /**
     * Constructor
     */
    public Workorder() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS ---\\
    public Long getId() {
        return this.id;
    }

    public void setId( Long id ) {
        this.id = id ;
    }

    public String getWkoName() {
        return this.wkoName;
    }

	public void setWkoName( String wkoName ) {
        this.wkoName = wkoName ;
    }

    public String getWkoExternalApp() {
        return this.wkoExternalApp;
    }

	public void setWkoExternalApp( String wkoExternalApp ) {
        this.wkoExternalApp = wkoExternalApp ;
    }

    public String getWkoExternalId() {
        return this.wkoExternalId;
    }

	public void setWkoExternalId( String wkoExternalId ) {
        this.wkoExternalId = wkoExternalId ;
    }

    public String getWkoCreationCell() {
        return this.wkoCreationCell;
    }

	public void setWkoCreationCell( String wkoCreationCell ) {
        this.wkoCreationCell = wkoCreationCell ;
    }

    public String getWkoCreationComment() {
        return this.wkoCreationComment;
    }

	public void setWkoCreationComment( String wkoCreationComment ) {
        this.wkoCreationComment = wkoCreationComment ;
    }

    public Boolean getWkoEmergency() {
        return this.wkoEmergency;
    }

	public void setWkoEmergency( Boolean wkoEmergency ) {
        this.wkoEmergency = wkoEmergency ;
    }

    public Boolean getWkoAppointment() {
        return this.wkoAppointment;
    }

	public void setWkoAppointment( Boolean wkoAppointment ) {
        this.wkoAppointment = wkoAppointment ;
    }

    public String getWkoAddress() {
        return this.wkoAddress;
    }

	public void setWkoAddress( String wkoAddress ) {
        this.wkoAddress = wkoAddress ;
    }

    public String getWkoStreetNumber() {
        return this.wkoStreetNumber;
    }

	public void setWkoStreetNumber( String wkoStreetNumber ) {
        this.wkoStreetNumber = wkoStreetNumber ;
    }

    public Date getWkoPlanningStartDate() {
        return this.wkoPlanningStartDate;
    }

	public void setWkoPlanningStartDate( Date wkoPlanningStartDate ) {
        this.wkoPlanningStartDate = wkoPlanningStartDate ;
    }

    public Date getWkoPlanningEndDate() {
        return this.wkoPlanningEndDate;
    }

	public void setWkoPlanningEndDate( Date wkoPlanningEndDate ) {
        this.wkoPlanningEndDate = wkoPlanningEndDate ;
    }

    public Date getWkoCompletionDate() {
        return this.wkoCompletionDate;
    }

	public void setWkoCompletionDate( Date wkoCompletionDate ) {
        this.wkoCompletionDate = wkoCompletionDate ;
    }

    public String getWkoRealizationUser() {
        return this.wkoRealizationUser;
    }

	public void setWkoRealizationUser( String wkoRealizationUser ) {
        this.wkoRealizationUser = wkoRealizationUser ;
    }

    public String getWkoRealizationCell() {
        return this.wkoRealizationCell;
    }

	public void setWkoRealizationCell( String wkoRealizationCell ) {
        this.wkoRealizationCell = wkoRealizationCell ;
    }

    public String getWkoRealizationComment() {
        return this.wkoRealizationComment;
    }

	public void setWkoRealizationComment( String wkoRealizationComment ) {
        this.wkoRealizationComment = wkoRealizationComment ;
    }

    public String getWkoCancelComment() {
        return this.wkoCancelComment;
    }

	public void setWkoCancelComment( String wkoCancelComment ) {
        this.wkoCancelComment = wkoCancelComment ;
    }

    public Date getWkoDmod() {
        return this.wkoDmod;
    }

	public void setWkoDmod( Date wkoDmod ) {
        this.wkoDmod = wkoDmod ;
    }

    public Date getWkoDcre() {
        return this.wkoDcre;
    }

	public void setWkoDcre( Date wkoDcre ) {
        this.wkoDcre = wkoDcre ;
    }

    public String getCtyLlabel() {
        return this.ctyLlabel;
    }

	public void setCtyLlabel( String ctyLlabel ) {
        this.ctyLlabel = ctyLlabel ;
    }

    public String getStrLlabel() {
        return this.strLlabel;
    }

	public void setStrLlabel( String strLlabel ) {
        this.strLlabel = strLlabel ;
    }

    public Date getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(Date deletedAt) {
        this.deletedAt = deletedAt;
    }

    public void markAsDeleted(Users user) {
        this.deletedAt = new Date();
        this.modifiedBy = user;
    }

    public BigDecimal getLongitude() {
        return this.longitude;
    }

	public void setLongitude( BigDecimal longitude ) {
        this.longitude = longitude ;
    }

    public BigDecimal getLatitude() {
        return this.latitude;
    }

	public void setLatitude( BigDecimal latitude ) {
        this.latitude = latitude ;
    }

    public Geometry getGeom() {
        return this.geom;
    }

	public void setGeom( Geometry geom ) {
        this.geom = geom ;
    }

    public Integer getWkoAgentNb() {
        return this.wkoAgentNb;
    }

	public void setWkoAgentNb( Integer wkoAgentNb ) {
        this.wkoAgentNb = wkoAgentNb ;
    }

    public String getWkoExtRef() {
        return this.wkoExtRef;
    }

	public void setWkoExtRef( String wkoExtRef ) {
        this.wkoExtRef = wkoExtRef ;
    }

    public Date getWkoExtDateSync() {
        return this.wkoExtDateSync;
    }

	public void setWkoExtDateSync( Date wkoExtDateSync ) {
        this.wkoExtDateSync = wkoExtDateSync ;
    }

    public Boolean getWkoExtToSync() {
        return this.wkoExtToSync;
    }

	public void setWkoExtToSync( Boolean wkoExtToSync ) {
        this.wkoExtToSync = wkoExtToSync ;
    }

    public String getWkoExtError() {
        return this.wkoExtError;
    }

	public void setWkoExtError( String wkoExtError ) {
        this.wkoExtError = wkoExtError ;
    }

    public Boolean getWkoAttachment() {
        return wkoAttachment;
    }

    public void setWkoAttachment(Boolean wkoAttachment) {
        this.wkoAttachment = wkoAttachment;
    }

    //--- GETTERS AND SETTERS FOR LINKS ---\\
    public Users getModifiedBy() {
        return this.modifiedBy;
    }

    public void setModifiedBy(Users modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public List<Task> getListOfTask() {
        if (this.listOfTask != null) {
            return this.listOfTask.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<Task> getListOfTaskWithDeleted() {
        return this.listOfTask;
    }

    public void setListOfTask(List<Task> listOfTask) {
        this.listOfTask = listOfTask;
    }

    public WorkorderTaskStatus getWorkorderTaskStatus() {
        return this.workorderTaskStatus;
    }

    public void setWorkorderTaskStatus(WorkorderTaskStatus workorderTaskStatus) {
        this.workorderTaskStatus = workorderTaskStatus;
    }

    public Users getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(Users createdBy) {
        this.createdBy = createdBy;
    }

    public Street getStreet() {
        return this.street;
    }

    public void setStreet(Street street) {
        this.street = street;
    }

    public City getCity() {
        return this.city;
    }

    public void setCity(City city) {
        this.city = city;
    }

}
