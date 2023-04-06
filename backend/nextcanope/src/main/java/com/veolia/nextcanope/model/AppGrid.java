/*
 * Created on 2023-04-03 ( 11:41:17 )
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;

/**
 * JPA entity class for "AppGrid"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="app_grid", schema="config" )
public class AppGrid implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    @Column(name="id", nullable=false)
    private Integer id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="geom", length=2147483647)
    private String geom ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="created_date")
    private Date createdDate ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="last_edited_date")
    private Date lastEditedDate ;


    //--- ENTITY LINKS ( RELATIONSHIP )

    /**
     * Constructor
     */
    public AppGrid() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Integer id ) {
        this.id = id ;
    }
    public Integer getId() {
        return this.id;
    }

    public void setGeom( String geom ) {
        this.geom = geom ;
    }
    public String getGeom() {
        return this.geom;
    }

    public void setCreatedDate( Date createdDate ) {
        this.createdDate = createdDate ;
    }
    public Date getCreatedDate() {
        return this.createdDate;
    }

    public void setLastEditedDate( Date lastEditedDate ) {
        this.lastEditedDate = lastEditedDate ;
    }
    public Date getLastEditedDate() {
        return this.lastEditedDate;
    }

    //--- GETTERS FOR LINKS

}