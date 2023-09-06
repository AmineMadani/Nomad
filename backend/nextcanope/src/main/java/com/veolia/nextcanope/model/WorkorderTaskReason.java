/*
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Date;
import java.util.List;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.stream.Collectors;
import java.util.ArrayList;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


/**
 * JPA entity class for "WorkorderTaskReason"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="workorder_task_reason", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class WorkorderTaskReason implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY ---\\
        @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
private Long id;

    //--- ENTITY DATA FIELDS ---\\
    @Column(name="wtr_code", nullable=false, length=2147483647)
    @JsonProperty("wtr_code")
    private String wtrCode;

    @Column(name="wtr_slabel", nullable=false, length=2147483647)
    @JsonProperty("wtr_slabel")
    private String wtrSlabel;

    @Column(name="wtr_llabel", length=2147483647)
    @JsonProperty("wtr_llabel")
    private String wtrLlabel;

    @Column(name="wtr_valid")
    @JsonProperty("wtr_valid")
    private Boolean wtrValid;

    @Column(name="wtr_work_request")
    @JsonProperty("wtr_work_request")
    private Boolean wtrWorkRequest;

    @Column(name="wtr_report")
    @JsonProperty("wtr_report")
    private Boolean wtrReport;

    @Column(name="wtr_wo")
    @JsonProperty("wtr_wo")
    private Boolean wtrWo;

    @Column(name="wtr_task")
    @JsonProperty("wtr_task")
    private Boolean wtrTask;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wtr_dcre")
    @CreationTimestamp
    @JsonProperty("wtr_dcre")
    private Date wtrDcre;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wtr_dmod")
    @UpdateTimestamp
    @JsonProperty("wtr_dmod")
    private Date wtrDmod;


    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="wtr_umod_id", referencedColumnName="id")
	@JsonIgnore
    private Users modifiedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="wtr_ucre_id", referencedColumnName="id")
	@JsonIgnore
    private Users createdBy;

    @OneToMany(mappedBy="workorderTaskReason")
    private List<Task> listOfTask;

    @OneToMany(mappedBy="workorderTaskReason")
    private List<AstWtr> listOfAstWtr;

    /**
     * Constructor
     */
    public WorkorderTaskReason() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS ---\\
    public Long getId() {
        return this.id;
    }

    public void setId( Long id ) {
        this.id = id ;
    }

    public String getWtrCode() {
        return this.wtrCode;
    }

	public void setWtrCode( String wtrCode ) {
        this.wtrCode = wtrCode ;
    }

    public String getWtrSlabel() {
        return this.wtrSlabel;
    }

	public void setWtrSlabel( String wtrSlabel ) {
        this.wtrSlabel = wtrSlabel ;
    }

    public String getWtrLlabel() {
        return this.wtrLlabel;
    }

	public void setWtrLlabel( String wtrLlabel ) {
        this.wtrLlabel = wtrLlabel ;
    }

    public Boolean getWtrValid() {
        return this.wtrValid;
    }

	public void setWtrValid( Boolean wtrValid ) {
        this.wtrValid = wtrValid ;
    }

    public Boolean getWtrWorkRequest() {
        return this.wtrWorkRequest;
    }

	public void setWtrWorkRequest( Boolean wtrWorkRequest ) {
        this.wtrWorkRequest = wtrWorkRequest ;
    }

    public Boolean getWtrReport() {
        return this.wtrReport;
    }

	public void setWtrReport( Boolean wtrReport ) {
        this.wtrReport = wtrReport ;
    }

    public Boolean getWtrWo() {
        return this.wtrWo;
    }

	public void setWtrWo( Boolean wtrWo ) {
        this.wtrWo = wtrWo ;
    }

    public Boolean getWtrTask() {
        return this.wtrTask;
    }

	public void setWtrTask( Boolean wtrTask ) {
        this.wtrTask = wtrTask ;
    }

    public Date getWtrDcre() {
        return this.wtrDcre;
    }

	public void setWtrDcre( Date wtrDcre ) {
        this.wtrDcre = wtrDcre ;
    }

    public Date getWtrDmod() {
        return this.wtrDmod;
    }

	public void setWtrDmod( Date wtrDmod ) {
        this.wtrDmod = wtrDmod ;
    }

    //--- GETTERS AND SETTERS FOR LINKS ---\\
    public Users getModifiedBy() {
        return this.modifiedBy;
    }

    public void setModifiedBy(Users modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public Users getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(Users createdBy) {
        this.createdBy = createdBy;
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

    public List<AstWtr> getListOfAstWtr() {
        return this.listOfAstWtr;
    }

    public void setListOfAstWtr(List<AstWtr> listOfAstWtr) {
        this.listOfAstWtr = listOfAstWtr;
    }

}
