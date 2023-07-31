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
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.CreationTimestamp;
import java.util.stream.Collectors;
import java.util.ArrayList;
import org.locationtech.jts.geom.Geometry;


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

    //--- ENTITY PRIMARY KEY ---\\
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id;

    //--- ENTITY DATA FIELDS ---\\
    @Column(name="tsk_name", length=2147483647)
    @JsonProperty("tsk_name")
    private String tskName;

    @Column(name="tsk_comment", length=2147483647)
    @JsonProperty("tsk_comment")
    private String tskComment;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="tsk_planning_start_date")
    @JsonProperty("tsk_planning_start_date")
    private Date tskPlanningStartDate;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="tsk_planning_end_date")
    @JsonProperty("tsk_planning_end_date")
    private Date tskPlanningEndDate;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="tsk_completion_date")
    @JsonProperty("tsk_completion_date")
    private Date tskCompletionDate;

    @Column(name="tsk_realization_user")
    @JsonProperty("tsk_realization_user")
    private Long tskRealizationUser;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="tsk_report_date")
    @JsonProperty("tsk_report_date")
    private Date tskReportDate;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="tsk_dcre")
    @CreationTimestamp
    @JsonProperty("tsk_dcre")
    private Date tskDcre;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="tsk_dmod")
    @UpdateTimestamp
    @JsonProperty("tsk_dmod")
    private Date tskDmod;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="tsk_ddel")
    @JsonProperty("tsk_ddel")
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

    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @ManyToOne
    @JoinColumn(name="wtr_id", referencedColumnName="id")
    private WorkorderTaskReason workorderTaskReason;

    @ManyToOne
    @JoinColumn(name="wts_id", referencedColumnName="id")
    private WorkorderTaskStatus workorderTaskStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="tsk_umod_id", referencedColumnName="id")
	@JsonIgnore
    private Users modifiedBy;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name="ass_id", referencedColumnName="id")
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="tsk_ucre_id", referencedColumnName="id")
	@JsonIgnore
    private Users createdBy;

    @ManyToOne
    @JoinColumn(name="wko_id", referencedColumnName="id")
    private Workorder workorder;

    @ManyToOne
    @JoinColumn(name="ctr_id", referencedColumnName="id")
    private Contract contract;

    @OneToMany(cascade = CascadeType.PERSIST, mappedBy="task")
    private List<Report> listOfReport;

    /**
     * Constructor
     */
    public Task() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS ---\\
    public Long getId() {
        return this.id;
    }

    public void setId( Long id ) {
        this.id = id ;
    }

    public String getTskName() {
        return this.tskName;
    }

	public void setTskName( String tskName ) {
        this.tskName = tskName ;
    }

    public String getTskComment() {
        return this.tskComment;
    }

	public void setTskComment( String tskComment ) {
        this.tskComment = tskComment ;
    }

    public Date getTskPlanningStartDate() {
        return this.tskPlanningStartDate;
    }

	public void setTskPlanningStartDate( Date tskPlanningStartDate ) {
        this.tskPlanningStartDate = tskPlanningStartDate ;
    }

    public Date getTskPlanningEndDate() {
        return this.tskPlanningEndDate;
    }

	public void setTskPlanningEndDate( Date tskPlanningEndDate ) {
        this.tskPlanningEndDate = tskPlanningEndDate ;
    }

    public Date getTskCompletionDate() {
        return this.tskCompletionDate;
    }

	public void setTskCompletionDate( Date tskCompletionDate ) {
        this.tskCompletionDate = tskCompletionDate ;
    }

    public Long getTskRealizationUser() {
        return this.tskRealizationUser;
    }

	public void setTskRealizationUser( Long tskRealizationUser ) {
        this.tskRealizationUser = tskRealizationUser ;
    }

    public Date getTskReportDate() {
        return this.tskReportDate;
    }

	public void setTskReportDate( Date tskReportDate ) {
        this.tskReportDate = tskReportDate ;
    }

    public Date getTskDcre() {
        return this.tskDcre;
    }

	public void setTskDcre( Date tskDcre ) {
        this.tskDcre = tskDcre ;
    }

    public Date getTskDmod() {
        return this.tskDmod;
    }

	public void setTskDmod( Date tskDmod ) {
        this.tskDmod = tskDmod ;
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

    //--- GETTERS AND SETTERS FOR LINKS ---\\
    public WorkorderTaskReason getWorkorderTaskReason() {
        return this.workorderTaskReason;
    }

    public void setWorkorderTaskReason(WorkorderTaskReason workorderTaskReason) {
        this.workorderTaskReason = workorderTaskReason;
    }

    public WorkorderTaskStatus getWorkorderTaskStatus() {
        return this.workorderTaskStatus;
    }

    public void setWorkorderTaskStatus(WorkorderTaskStatus workorderTaskStatus) {
        this.workorderTaskStatus = workorderTaskStatus;
    }

    public Users getModifiedBy() {
        return this.modifiedBy;
    }

    public void setModifiedBy(Users modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public Asset getAsset() {
        return this.asset;
    }

    public void setAsset(Asset asset) {
        this.asset = asset;
    }

    public Users getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(Users createdBy) {
        this.createdBy = createdBy;
    }

    public Workorder getWorkorder() {
        return this.workorder;
    }

    public void setWorkorder(Workorder workorder) {
        this.workorder = workorder;
    }

    public Contract getContract() {
        return this.contract;
    }

    public void setContract(Contract contract) {
        this.contract = contract;
    }

    public List<Report> getListOfReport() {
        if (this.listOfReport != null) {
            return this.listOfReport.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<Report> getListOfReportWithDeleted() {
        return this.listOfReport;
    }

    public void setListOfReport(List<Report> listOfReport) {
        this.listOfReport = listOfReport;
    }

}
