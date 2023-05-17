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
 * JPA entity class for "Task"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="task", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class Task implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="wko_id")
	@JsonProperty("wko_id")
    private Long wkoId ;

    @Column(name="tsk_name", length=2147483647)
	@JsonProperty("tsk_name")
    private String tskName ;

    @Column(name="wts_id")
	@JsonProperty("wts_id")
    private Long wtsId ;

    @Column(name="wtr_id")
	@JsonProperty("wtr_id")
    private Long wtrId ;

    @Column(name="tsk_comment", length=2147483647)
	@JsonProperty("tsk_comment")
    private String tskComment ;

    @Column(name="ctr_id")
	@JsonProperty("ctr_id")
    private Long ctrId ;

    @Column(name="ass_id")
	@JsonProperty("ass_id")
    private Long assId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="tsk_planning_start_date")
	@JsonProperty("tsk_planning_start_date")
    private Date tskPlanningStartDate ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="tsk_planning_end_date")
	@JsonProperty("tsk_planning_end_date")
    private Date tskPlanningEndDate ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="tsk_completion_date")
	@JsonProperty("tsk_completion_date")
    private Date tskCompletionDate ;

    @Column(name="tsk_realization_user")
	@JsonProperty("tsk_realization_user")
    private Long tskRealizationUser ;

    @Column(name="tsk_ucre_id")
	@JsonProperty("tsk_ucre_id")
    private Long tskUcreId ;

    @Column(name="tsk_umod_id")
	@JsonProperty("tsk_umod_id")
    private Long tskUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="tsk_dcre")
	@JsonProperty("tsk_dcre")
    private Date tskDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="tsk_dmod")
	@JsonProperty("tsk_dmod")
    private Date tskDmod ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="tsk_ddel")
	@JsonProperty("tsk_ddel")
    private Date tskDdel ;

    @Column(name="longitude")
	@JsonProperty("longitude")
    private BigDecimal longitude ;

    @Column(name="latitude")
	@JsonProperty("latitude")
    private BigDecimal latitude ;

    @Column(name="geom", length=2147483647)
	@JsonProperty("geom")
    private Geometry geom ;

    @Column(name="tsk_agent_nb")
	@JsonProperty("tsk_agent_nb")
    private Integer tskAgentNb ;


    //--- ENTITY LINKS ( RELATIONSHIP )

    @ManyToOne
    @JoinColumn(name="wtr_id", referencedColumnName="id", insertable=false, updatable=false)
    private WorkorderTaskReason workorderTaskReason ; 


    @ManyToOne
    @JoinColumn(name="wts_id", referencedColumnName="id", insertable=false, updatable=false)
    private WorkorderTaskStatus workorderTaskStatus ; 


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="tsk_umod_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users modifiedBy ; 


    @ManyToOne
    @JoinColumn(name="ass_id", referencedColumnName="id", insertable=false, updatable=false)
    private Asset asset ; 


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="tsk_ucre_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users createdBy ; 


    @ManyToOne
    @JoinColumn(name="wko_id", referencedColumnName="id", insertable=false, updatable=false)
    private Workorder workorder ; 


    @ManyToOne
    @JoinColumn(name="ctr_id", referencedColumnName="id", insertable=false, updatable=false)
    private Contract contract ; 


    @OneToMany(mappedBy="task")
    private List<Report> listOfReport ; 


    /**
     * Constructor
     */
    public Task() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Long id ) {
        this.id = id ;
    }
    public Long getId() {
        return this.id;
    }

	public void setWkoId( Long wkoId ) {
        this.wkoId = wkoId ;
    }

    public Long getWkoId() {
        return this.wkoId;
    }

	public void setTskName( String tskName ) {
        this.tskName = tskName ;
    }

    public String getTskName() {
        return this.tskName;
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

	public void setTskComment( String tskComment ) {
        this.tskComment = tskComment ;
    }

    public String getTskComment() {
        return this.tskComment;
    }

	public void setCtrId( Long ctrId ) {
        this.ctrId = ctrId ;
    }

    public Long getCtrId() {
        return this.ctrId;
    }

	public void setAssId( Long assId ) {
        this.assId = assId ;
    }

    public Long getAssId() {
        return this.assId;
    }

	public void setTskPlanningStartDate( Date tskPlanningStartDate ) {
        this.tskPlanningStartDate = tskPlanningStartDate ;
    }

    public Date getTskPlanningStartDate() {
        return this.tskPlanningStartDate;
    }

	public void setTskPlanningEndDate( Date tskPlanningEndDate ) {
        this.tskPlanningEndDate = tskPlanningEndDate ;
    }

    public Date getTskPlanningEndDate() {
        return this.tskPlanningEndDate;
    }

	public void setTskCompletionDate( Date tskCompletionDate ) {
        this.tskCompletionDate = tskCompletionDate ;
    }

    public Date getTskCompletionDate() {
        return this.tskCompletionDate;
    }

	public void setTskRealizationUser( Long tskRealizationUser ) {
        this.tskRealizationUser = tskRealizationUser ;
    }

    public Long getTskRealizationUser() {
        return this.tskRealizationUser;
    }

	public void setTskUcreId( Long tskUcreId ) {
        this.tskUcreId = tskUcreId ;
    }

    public Long getTskUcreId() {
        return this.tskUcreId;
    }

	public void setTskUmodId( Long tskUmodId ) {
        this.tskUmodId = tskUmodId ;
    }

    public Long getTskUmodId() {
        return this.tskUmodId;
    }

	public void setTskDcre( Date tskDcre ) {
        this.tskDcre = tskDcre ;
    }

    public Date getTskDcre() {
        return this.tskDcre;
    }

	public void setTskDmod( Date tskDmod ) {
        this.tskDmod = tskDmod ;
    }

    public Date getTskDmod() {
        return this.tskDmod;
    }

	public void setTskDdel( Date tskDdel ) {
        this.tskDdel = tskDdel ;
    }

    public Date getTskDdel() {
        return this.tskDdel;
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

	public void setTskAgentNb( Integer tskAgentNb ) {
        this.tskAgentNb = tskAgentNb ;
    }

    public Integer getTskAgentNb() {
        return this.tskAgentNb;
    }

    //--- GETTERS FOR LINKS
    public WorkorderTaskReason getWorkorderTaskReason() {
        return this.workorderTaskReason;
    } 

    public WorkorderTaskStatus getWorkorderTaskStatus() {
        return this.workorderTaskStatus;
    } 

    public Users getModifiedBy() {
        return this.modifiedBy;
    } 

    public Asset getAsset() {
        return this.asset;
    } 

    public Users getCreatedBy() {
        return this.createdBy;
    } 

    public Workorder getWorkorder() {
        return this.workorder;
    } 

    public Contract getContract() {
        return this.contract;
    } 

    public List<Report> getListOfReport() {
        return this.listOfReport;
    } 


}
