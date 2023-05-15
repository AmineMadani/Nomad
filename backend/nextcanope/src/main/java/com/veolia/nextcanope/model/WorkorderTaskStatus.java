/*
 * Created on 2023-05-12 ( 22:06:20 )
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import jakarta.persistence.*;

/**
 * JPA entity class for "WorkorderTaskStatus"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="workorder_task_status", schema="nomad" )
public class WorkorderTaskStatus implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="wts_code", nullable=false, length=2147483647)
    private String wtsCode ;

    @Column(name="wts_slabel", nullable=false, length=2147483647)
    private String wtsSlabel ;

    @Column(name="wts_llabel", length=2147483647)
    private String wtsLlabel ;

    @Column(name="wts_wo")
    private Boolean wtsWo ;

    @Column(name="wts_task")
    private Boolean wtsTask ;

    @Column(name="wts_valid")
    private Boolean wtsValid ;

    @Column(name="wts_ucre_id")
    private Long wtsUcreId ;

    @Column(name="wts_umod_id")
    private Long wtsUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wts_dcre")
    private Date wtsDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="wts_dmod")
    private Date wtsDmod ;


    //--- ENTITY LINKS ( RELATIONSHIP )
    @ManyToOne
    @JoinColumn(name="wts_ucre_id", referencedColumnName="id", insertable=false, updatable=false)
    private Users createdBy ; 

    @OneToMany(mappedBy="workorderTaskStatus")
    private List<Workorder> listOfWorkorder ; 

    @OneToMany(mappedBy="workorderTaskStatus")
    private List<Task> listOfTask ; 

    @ManyToOne
    @JoinColumn(name="wts_umod_id", referencedColumnName="id", insertable=false, updatable=false)
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

    public List<Workorder> getListOfWorkorder() {
        return this.listOfWorkorder;
    } 

    public List<Task> getListOfTask() {
        return this.listOfTask;
    } 

    public Users getModifiedBy() {
        return this.modifiedBy;
    } 


}
