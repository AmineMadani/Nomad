/*
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;

import org.locationtech.jts.geom.Geometry;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="wko_name", length=2147483647)
	@JsonProperty("wko_name")
    private String wkoName ;

    @Column(name="wko_creation_cell", length=2147483647)
	@JsonProperty("wko_creation_cell")
    private String wkoCreationCell ;

    @Column(name="wko_creation_comment", length=2147483647)
	@JsonProperty("wko_creation_comment")
    private String wkoCreationComment ;

    @Column(name="wko_emergency")
	@JsonProperty("wko_emergency")
    private Boolean wkoEmergency ;

    @Column(name="wko_appointment")
	@JsonProperty("wko_appointment")
    private Boolean wkoAppointment ;

    @Column(name="wko_address", length=2147483647)
	@JsonProperty("wko_address")
    private String wkoAddress ;

    @Column(name="wko_street_number", length=2147483647)
	@JsonProperty("wko_street_number")
    private String wkoStreetNumber ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_planning_start_date")
	@JsonProperty("wko_planning_start_date")
    private Date wkoPlanningStartDate ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_planning_end_date")
	@JsonProperty("wko_planning_end_date")
    private Date wkoPlanningEndDate ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_completion_date")
	@JsonProperty("wko_completion_date")
    private Date wkoCompletionDate ;

    @Column(name="wko_realization_user", length=2147483647)
	@JsonProperty("wko_realization_user")
    private String wkoRealizationUser ;

    @Column(name="wko_realization_cell", length=2147483647)
	@JsonProperty("wko_realization_cell")
    private String wkoRealizationCell ;

    @Column(name="wko_realization_comment", length=2147483647)
	@JsonProperty("wko_realization_comment")
    private String wkoRealizationComment ;

    @Column(name="wko_ucre_id")
	@JsonProperty("wko_ucre_id")
    private Long wkoUcreId ;

    @Column(name="wko_umod_id")
	@JsonProperty("wko_umod_id")
    private Long wkoUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_dmod")
	@JsonProperty("wko_dmod")
    private Date wkoDmod ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_dcre")
	@JsonProperty("wko_dcre")
    private Date wkoDcre ;

    @Column(name="cty_id")
	@JsonProperty("cty_id")
    private Long ctyId ;

    @Column(name="cty_llabel", length=2147483647)
	@JsonProperty("cty_llabel")
    private String ctyLlabel ;

    @Column(name="ass_id", nullable=false)
	@JsonProperty("ass_id")
    private Long assId ;

    @Column(name="wts_id")
	@JsonProperty("wts_id")
    private Long wtsId ;

    @Column(name="wtr_id")
	@JsonProperty("wtr_id")
    private Long wtrId ;

    @Column(name="str_id")
	@JsonProperty("str_id")
    private Long strId ;

    @Column(name="str_llabel", length=2147483647)
	@JsonProperty("str_llabel")
    private String strLlabel ;

    @Column(name="ctr_id")
	@JsonProperty("ctr_id")
    private Long ctrId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_ddel")
	@JsonProperty("wko_ddel")
    private Date wkoDdel ;

    @Column(name="longitude")
	@JsonProperty("longitude")
    private BigDecimal longitude ;

    @Column(name="latitude")
	@JsonProperty("latitude")
    private BigDecimal latitude ;

    @Column(name="geom", length=2147483647)
	@JsonProperty("geom")
    private Geometry geom ;

    @Column(name="wko_agent_nb")
	@JsonProperty("wko_agent_nb")
    private Integer wkoAgentNb ;

    @Column(name="wko_ext_ref", length=2147483647)
	@JsonProperty("wko_ext_ref")
    private String wkoExtRef ;

    @Temporal(TemporalType.DATE)
    @Column(name="wko_ext_date_sync")
	@JsonProperty("wko_ext_date_sync")
    private Date wkoExtDateSync ;

    @Column(name="wko_ext_to_sync", nullable=false)
	@JsonProperty("wko_ext_to_sync")
    private Boolean wkoExtToSync ;

    @Column(name="wko_ext_error", length=2147483647)
	@JsonProperty("wko_ext_error")
    private String wkoExtError ;


    //--- ENTITY LINKS ( RELATIONSHIP )

    @OneToMany(mappedBy="workorder")
    private List<Task> listOfTask ; 


    @ManyToOne
    @JoinColumn(name="wts_id", referencedColumnName="id", insertable=false, updatable=false)
    private WorkorderTaskStatus workorderTaskStatus ; 


    @ManyToOne
    @JoinColumn(name="wtr_id", referencedColumnName="id", insertable=false, updatable=false)
    private WorkorderTaskReason workorderTaskReason ; 


    @ManyToOne
    @JoinColumn(name="ass_id", referencedColumnName="id", insertable=false, updatable=false)
    private Asset asset ; 


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="wko_umod_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users modifiedBy ; 


    @ManyToOne
    @JoinColumn(name="ctr_id", referencedColumnName="id", insertable=false, updatable=false)
    private Contract contract ; 


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="wko_ucre_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users createdBy ; 


    @ManyToOne
    @JoinColumn(name="str_id", referencedColumnName="id", insertable=false, updatable=false)
    private Street street ; 


    @ManyToOne
    @JoinColumn(name="cty_id", referencedColumnName="id", insertable=false, updatable=false)
    private City city ; 


    /**
     * Constructor
     */
    public Workorder() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Long id ) {
        this.id = id ;
    }
    public Long getId() {
        return this.id;
    }

	public void setWkoName( String wkoName ) {
        this.wkoName = wkoName ;
    }

    public String getWkoName() {
        return this.wkoName;
    }

	public void setWkoCreationCell( String wkoCreationCell ) {
        this.wkoCreationCell = wkoCreationCell ;
    }

    public String getWkoCreationCell() {
        return this.wkoCreationCell;
    }

	public void setWkoCreationComment( String wkoCreationComment ) {
        this.wkoCreationComment = wkoCreationComment ;
    }

    public String getWkoCreationComment() {
        return this.wkoCreationComment;
    }

	public void setWkoEmergency( Boolean wkoEmergency ) {
        this.wkoEmergency = wkoEmergency ;
    }

    public Boolean getWkoEmergency() {
        return this.wkoEmergency;
    }

	public void setWkoAppointment( Boolean wkoAppointment ) {
        this.wkoAppointment = wkoAppointment ;
    }

    public Boolean getWkoAppointment() {
        return this.wkoAppointment;
    }

	public void setWkoAddress( String wkoAddress ) {
        this.wkoAddress = wkoAddress ;
    }

    public String getWkoAddress() {
        return this.wkoAddress;
    }

	public void setWkoStreetNumber( String wkoStreetNumber ) {
        this.wkoStreetNumber = wkoStreetNumber ;
    }

    public String getWkoStreetNumber() {
        return this.wkoStreetNumber;
    }

	public void setWkoPlanningStartDate( Date wkoPlanningStartDate ) {
        this.wkoPlanningStartDate = wkoPlanningStartDate ;
    }

    public Date getWkoPlanningStartDate() {
        return this.wkoPlanningStartDate;
    }

	public void setWkoPlanningEndDate( Date wkoPlanningEndDate ) {
        this.wkoPlanningEndDate = wkoPlanningEndDate ;
    }

    public Date getWkoPlanningEndDate() {
        return this.wkoPlanningEndDate;
    }

	public void setWkoCompletionDate( Date wkoCompletionDate ) {
        this.wkoCompletionDate = wkoCompletionDate ;
    }

    public Date getWkoCompletionDate() {
        return this.wkoCompletionDate;
    }

	public void setWkoRealizationUser( String wkoRealizationUser ) {
        this.wkoRealizationUser = wkoRealizationUser ;
    }

    public String getWkoRealizationUser() {
        return this.wkoRealizationUser;
    }

	public void setWkoRealizationCell( String wkoRealizationCell ) {
        this.wkoRealizationCell = wkoRealizationCell ;
    }

    public String getWkoRealizationCell() {
        return this.wkoRealizationCell;
    }

	public void setWkoRealizationComment( String wkoRealizationComment ) {
        this.wkoRealizationComment = wkoRealizationComment ;
    }

    public String getWkoRealizationComment() {
        return this.wkoRealizationComment;
    }

	public void setWkoUcreId( Long wkoUcreId ) {
        this.wkoUcreId = wkoUcreId ;
    }

    public Long getWkoUcreId() {
        return this.wkoUcreId;
    }

	public void setWkoUmodId( Long wkoUmodId ) {
        this.wkoUmodId = wkoUmodId ;
    }

    public Long getWkoUmodId() {
        return this.wkoUmodId;
    }

	public void setWkoDmod( Date wkoDmod ) {
        this.wkoDmod = wkoDmod ;
    }

    public Date getWkoDmod() {
        return this.wkoDmod;
    }

	public void setWkoDcre( Date wkoDcre ) {
        this.wkoDcre = wkoDcre ;
    }

    public Date getWkoDcre() {
        return this.wkoDcre;
    }

	public void setCtyId( Long ctyId ) {
        this.ctyId = ctyId ;
    }

    public Long getCtyId() {
        return this.ctyId;
    }

	public void setCtyLlabel( String ctyLlabel ) {
        this.ctyLlabel = ctyLlabel ;
    }

    public String getCtyLlabel() {
        return this.ctyLlabel;
    }

	public void setAssId( Long assId ) {
        this.assId = assId ;
    }

    public Long getAssId() {
        return this.assId;
    }

	public void setWtsId( Long wtsId ) {
        this.wtsId = wtsId ;
    }

    public Long getWtsId() {
        return this.wtsId;
    }

	public void setWtrId( Long wtrId ) {
        this.wtrId = wtrId ;
    }

    public Long getWtrId() {
        return this.wtrId;
    }

	public void setStrId( Long strId ) {
        this.strId = strId ;
    }

    public Long getStrId() {
        return this.strId;
    }

	public void setStrLlabel( String strLlabel ) {
        this.strLlabel = strLlabel ;
    }

    public String getStrLlabel() {
        return this.strLlabel;
    }

	public void setCtrId( Long ctrId ) {
        this.ctrId = ctrId ;
    }

    public Long getCtrId() {
        return this.ctrId;
    }

	public void setWkoDdel( Date wkoDdel ) {
        this.wkoDdel = wkoDdel ;
    }

    public Date getWkoDdel() {
        return this.wkoDdel;
    }

	public void setLongitude( BigDecimal longitude ) {
        this.longitude = longitude ;
    }

    public BigDecimal getLongitude() {
        return this.longitude;
    }

	public void setLatitude( BigDecimal latitude ) {
        this.latitude = latitude ;
    }

    public BigDecimal getLatitude() {
        return this.latitude;
    }

	public void setGeom( Geometry geom ) {
        this.geom = geom ;
    }

    public Geometry getGeom() {
        return this.geom;
    }

	public void setWkoAgentNb( Integer wkoAgentNb ) {
        this.wkoAgentNb = wkoAgentNb ;
    }

    public Integer getWkoAgentNb() {
        return this.wkoAgentNb;
    }

	public void setWkoExtRef( String wkoExtRef ) {
        this.wkoExtRef = wkoExtRef ;
    }

    public String getWkoExtRef() {
        return this.wkoExtRef;
    }

	public void setWkoExtDateSync( Date wkoExtDateSync ) {
        this.wkoExtDateSync = wkoExtDateSync ;
    }

    public Date getWkoExtDateSync() {
        return this.wkoExtDateSync;
    }

	public void setWkoExtToSync( Boolean wkoExtToSync ) {
        this.wkoExtToSync = wkoExtToSync ;
    }

    public Boolean getWkoExtToSync() {
        return this.wkoExtToSync;
    }

	public void setWkoExtError( String wkoExtError ) {
        this.wkoExtError = wkoExtError ;
    }

    public String getWkoExtError() {
        return this.wkoExtError;
    }

    //--- GETTERS FOR LINKS
    public List<Task> getListOfTask() {
        return this.listOfTask;
    } 

    public WorkorderTaskStatus getWorkorderTaskStatus() {
        return this.workorderTaskStatus;
    } 

    public WorkorderTaskReason getWorkorderTaskReason() {
        return this.workorderTaskReason;
    } 

    public Asset getAsset() {
        return this.asset;
    } 

    public Users getModifiedBy() {
        return this.modifiedBy;
    } 

    public Contract getContract() {
        return this.contract;
    } 

    public Users getCreatedBy() {
        return this.createdBy;
    } 

    public Street getStreet() {
        return this.street;
    } 

    public City getCity() {
        return this.city;
    } 


}
