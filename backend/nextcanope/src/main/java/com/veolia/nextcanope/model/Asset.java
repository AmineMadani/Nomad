/*
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * JPA entity class for "Asset"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="asset", schema="nomad" )
public class Asset implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="ass_obj_ref", length=2147483647)
    private String assObjRef ;

    @Column(name="ass_obj_table", nullable=false, length=2147483647)
    private String assObjTable ;

    @Column(name="ass_valid")
    private Boolean assValid ;

    @Column(name="ass_ucre_id")
    private Long assUcreId ;

    @Column(name="ass_umod_id")
    private Long assUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="ass_dcre")
    private Date assDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="ass_dmod")
    private Date assDmod ;


    //--- ENTITY LINKS ( RELATIONSHIP )

    @OneToMany(mappedBy="asset")
    private List<Workorder> listOfWorkorder ; 


    @OneToMany(mappedBy="asset")
    private List<Task> listOfTask ; 


    @ManyToOne
    @JoinColumn(name="ass_umod_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users modifiedBy ; 


    @ManyToOne
    @JoinColumn(name="ass_obj_table", referencedColumnName="lyr_table_name", insertable=false, updatable=false)
    private Layer layer ; 


    @ManyToOne
    @JoinColumn(name="ass_ucre_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users createdBy ; 


    /**
     * Constructor
     */
    public Asset() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Long id ) {
        this.id = id ;
    }
    public Long getId() {
        return this.id;
    }

    public void setAssObjRef( String assObjRef ) {
        this.assObjRef = assObjRef ;
    }
    public String getAssObjRef() {
        return this.assObjRef;
    }

    public void setAssObjTable( String assObjTable ) {
        this.assObjTable = assObjTable ;
    }
    public String getAssObjTable() {
        return this.assObjTable;
    }

    public void setAssValid( Boolean assValid ) {
        this.assValid = assValid ;
    }
    public Boolean getAssValid() {
        return this.assValid;
    }

    public void setAssUcreId( Long assUcreId ) {
        this.assUcreId = assUcreId ;
    }
    public Long getAssUcreId() {
        return this.assUcreId;
    }

    public void setAssUmodId( Long assUmodId ) {
        this.assUmodId = assUmodId ;
    }
    public Long getAssUmodId() {
        return this.assUmodId;
    }

    public void setAssDcre( Date assDcre ) {
        this.assDcre = assDcre ;
    }
    public Date getAssDcre() {
        return this.assDcre;
    }

    public void setAssDmod( Date assDmod ) {
        this.assDmod = assDmod ;
    }
    public Date getAssDmod() {
        return this.assDmod;
    }

    //--- GETTERS FOR LINKS
    public List<Workorder> getListOfWorkorder() {
        return this.listOfWorkorder;
    } 

    public List<Task> getListOfTask() {
        return this.listOfTask;
    } 

    public Users getModifiedBy() {
        return this.modifiedBy;
    } 

    public Layer getLayer() {
        return this.layer;
    } 

    public Users getCreatedBy() {
        return this.createdBy;
    } 


}
