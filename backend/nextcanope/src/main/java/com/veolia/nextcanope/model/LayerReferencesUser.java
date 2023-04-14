/*
 * Created on 2023-04-07 ( 18:10:03 )
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;

/**
 * JPA entity class for "LayerReferencesUser"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="layer_references_user", schema="config" )
public class LayerReferencesUser implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    @Column(name="id", nullable=false)
    private Integer id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="layer_reference_id", nullable=false)
    private Integer layerReferenceId ;

    @Column(name="user_id", nullable=false)
    private Integer userId ;

    @Column(name="position", nullable=false)
    private Integer position ;

    @Column(name="display_type", nullable=false, length=2147483647)
    private String displayType ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="created_date")
    private Date createdDate ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="last_edited_date")
    private Date lastEditedDate ;


    //--- ENTITY LINKS ( RELATIONSHIP )
    @ManyToOne
    @JoinColumn(name="user_id", referencedColumnName="id", insertable=false, updatable=false)
    private AppUser appUser ; 

    @ManyToOne
    @JoinColumn(name="layer_reference_id", referencedColumnName="id", insertable=false, updatable=false)
    private LayerReferences layerReferences ; 


    /**
     * Constructor
     */
    public LayerReferencesUser() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Integer id ) {
        this.id = id ;
    }
    public Integer getId() {
        return this.id;
    }

    public void setLayerReferenceId( Integer layerReferenceId ) {
        this.layerReferenceId = layerReferenceId ;
    }
    public Integer getLayerReferenceId() {
        return this.layerReferenceId;
    }

    public void setUserId( Integer userId ) {
        this.userId = userId ;
    }
    public Integer getUserId() {
        return this.userId;
    }

    public void setPosition( Integer position ) {
        this.position = position ;
    }
    public Integer getPosition() {
        return this.position;
    }

    public void setDisplayType( String displayType ) {
        this.displayType = displayType ;
    }
    public String getDisplayType() {
        return this.displayType;
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
    public AppUser getAppUser() {
        return this.appUser;
    } 

    public LayerReferences getLayerReferences() {
        return this.layerReferences;
    } 


}
