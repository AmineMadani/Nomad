/*
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * JPA entity class for "WorkorderTaskStatus"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="workorder_task_status", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class WorkorderTaskStatus implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="wts_code", nullable=false, length=2147483647)
	@JsonProperty("wts_code")
    private String wtsCode ;

    @Column(name="wts_slabel", nullable=false, length=2147483647)
	@JsonProperty("wts_slabel")
    private String wtsSlabel ;

    @Column(name="wts_llabel", length=2147483647)
	@JsonProperty("wts_llabel")
    private String wtsLlabel ;

    @Column(name="wts_wo")
	@JsonProperty("wts_wo")
    private Boolean wtsWo ;

    @Column(name="wts_task")
	@JsonProperty("wts_task")
    private Boolean wtsTask ;

    @Column(name="wts_valid")
	@JsonProperty("wts_valid")
    private Boolean wtsValid ;

    @Column(name="wts_ucre_id")
	@JsonProperty("wts_ucre_id")
    private Long wtsUcreId ;

    @Column(name="wts_umod_id")
	@JsonProperty("wts_umod_id")
    private Long wtsUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wts_dcre")
	@JsonProperty("wts_dcre")
    private Date wtsDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wts_dmod")
	@JsonProperty("wts_dmod")
    private Date wtsDmod ;


    //--- ENTITY LINKS ( RELATIONSHIP )

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="wts_ucre_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users createdBy ; 


    @OneToMany(mappedBy="workorderTaskStatus")
    private List<Task> listOfTask ; 


    @OneToMany(mappedBy="workorderTaskStatus")
    private List<Workorder> listOfWorkorder ; 


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="wts_umod_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users modifiedBy ; 


    /**
     * Constructor
     */
    public WorkorderTaskStatus() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Long id ) {
        this.id = id ;
    }
    public Long getId() {
        return this.id;
    }

	public void setWtsCode( String wtsCode ) {
        this.wtsCode = wtsCode ;
    }

    public String getWtsCode() {
        return this.wtsCode;
    }

	public void setWtsSlabel( String wtsSlabel ) {
        this.wtsSlabel = wtsSlabel ;
    }

    public String getWtsSlabel() {
        return this.wtsSlabel;
    }

	public void setWtsLlabel( String wtsLlabel ) {
        this.wtsLlabel = wtsLlabel ;
    }

    public String getWtsLlabel() {
        return this.wtsLlabel;
    }

	public void setWtsWo( Boolean wtsWo ) {
        this.wtsWo = wtsWo ;
    }

    public Boolean getWtsWo() {
        return this.wtsWo;
    }

	public void setWtsTask( Boolean wtsTask ) {
        this.wtsTask = wtsTask ;
    }

    public Boolean getWtsTask() {
        return this.wtsTask;
    }

	public void setWtsValid( Boolean wtsValid ) {
        this.wtsValid = wtsValid ;
    }

    public Boolean getWtsValid() {
        return this.wtsValid;
    }

	public void setWtsUcreId( Long wtsUcreId ) {
        this.wtsUcreId = wtsUcreId ;
    }

    public Long getWtsUcreId() {
        return this.wtsUcreId;
    }

	public void setWtsUmodId( Long wtsUmodId ) {
        this.wtsUmodId = wtsUmodId ;
    }

    public Long getWtsUmodId() {
        return this.wtsUmodId;
    }

	public void setWtsDcre( Date wtsDcre ) {
        this.wtsDcre = wtsDcre ;
    }

    public Date getWtsDcre() {
        return this.wtsDcre;
    }

	public void setWtsDmod( Date wtsDmod ) {
        this.wtsDmod = wtsDmod ;
    }

    public Date getWtsDmod() {
        return this.wtsDmod;
    }

    //--- GETTERS FOR LINKS
    public Users getCreatedBy() {
        return this.createdBy;
    } 

    public List<Task> getListOfTask() {
        return this.listOfTask;
    } 

    public List<Workorder> getListOfWorkorder() {
        return this.listOfWorkorder;
    } 

    public Users getModifiedBy() {
        return this.modifiedBy;
    } 


}
