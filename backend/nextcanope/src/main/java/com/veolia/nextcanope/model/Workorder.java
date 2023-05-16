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

/**
 * JPA entity class for "Workorder"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="workorder", schema="nomad" )
public class Workorder implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="wko_name", length=2147483647)
    private String wkoName ;

    @Column(name="wko_external_app", length=2147483647)
    private String wkoExternalApp ;

    @Column(name="wko_external_id", length=2147483647)
    private String wkoExternalId ;

    @Column(name="wko_creation_cell", length=2147483647)
    private String wkoCreationCell ;

    @Column(name="wko_creation_comment", length=2147483647)
    private String wkoCreationComment ;

    @Column(name="wko_emergency")
    private Boolean wkoEmergency ;

    @Column(name="wko_appointment")
    private Boolean wkoAppointment ;

    @Column(name="wko_address", length=2147483647)
    private String wkoAddress ;

    @Column(name="wko_street_number", length=2147483647)
    private String wkoStreetNumber ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_planning_start_date")
    private Date wkoPlanningStartDate ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_planning_end_date")
    private Date wkoPlanningEndDate ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_completion_date")
    private Date wkoCompletionDate ;

    @Column(name="wko_realization_user", length=2147483647)
    private String wkoRealizationUser ;

    @Column(name="wko_realization_cell", length=2147483647)
    private String wkoRealizationCell ;

    @Column(name="wko_realization_comment", length=2147483647)
    private String wkoRealizationComment ;

    @Column(name="wko_ucre_id")
    private Long wkoUcreId ;

    @Column(name="wko_umod_id")
    private Long wkoUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_dmod")
    private Date wkoDmod ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_dcre")
    private Date wkoDcre ;

    @Column(name="cty_id")
    private Long ctyId ;

    @Column(name="cty_llabel", length=2147483647)
    private String ctyLlabel ;

    @Column(name="ass_id", nullable=false)
    private Long assId ;

    @Column(name="wts_id")
    private Long wtsId ;

    @Column(name="wtr_id")
    private Long wtrId ;

    @Column(name="str_id")
    private Long strId ;

    @Column(name="str_llabel", length=2147483647)
    private String strLlabel ;

    @Column(name="ctr_id")
    private Long ctrId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wko_ddel")
    private Date wkoDdel ;

    @Column(name="longitude")
    private BigDecimal longitude ;

    @Column(name="latitude")
    private BigDecimal latitude ;

    @Column(name="geom", length=2147483647)
    private String geom ;


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

    public void setWkoExternalApp( String wkoExternalApp ) {
        this.wkoExternalApp = wkoExternalApp ;
    }
    public String getWkoExternalApp() {
        return this.wkoExternalApp;
    }

    public void setWkoExternalId( String wkoExternalId ) {
        this.wkoExternalId = wkoExternalId ;
    }
    public String getWkoExternalId() {
        return this.wkoExternalId;
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

    public void setGeom( String geom ) {
        this.geom = geom ;
    }
    public String getGeom() {
        return this.geom;
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
