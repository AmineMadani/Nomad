/*
 * Created on 2023-04-07 ( 18:10:02 )
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import jakarta.persistence.*;

/**
 * JPA entity class for "LayerReferences"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="layer_references", schema="config" )
public class LayerReferences implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    @Column(name="id", nullable=false)
    private Integer id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="layer_id", nullable=false)
    private Integer layerId ;

    @Column(name="reference_key", nullable=false, length=63)
    private String referenceKey ;

    @Column(name="alias", length=2147483647)
    private String alias ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="created_date")
    private Date createdDate ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="last_edited_date")
    private Date lastEditedDate ;


    //--- ENTITY LINKS ( RELATIONSHIP )
    @OneToMany(mappedBy="layerReferences")
    private List<LayerReferencesUser> listOfLayerReferencesUser ; 

    @ManyToOne
    @JoinColumn(name="layer_id", referencedColumnName="id", insertable=false, updatable=false)
    private Layer layer ; 

    @OneToMany(mappedBy="layerReferences")
    private List<LayerReferencesDefault> listOfLayerReferencesDefault ; 


    /**
     * Constructor
     */
    public LayerReferences() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Integer id ) {
        this.id = id ;
    }
    public Integer getId() {
        return this.id;
    }

    public void setLayerId( Integer layerId ) {
        this.layerId = layerId ;
    }
    public Integer getLayerId() {
        return this.layerId;
    }

    public void setReferenceKey( String referenceKey ) {
        this.referenceKey = referenceKey ;
    }
    public String getReferenceKey() {
        return this.referenceKey;
    }

    public void setAlias( String alias ) {
        this.alias = alias ;
    }
    public String getAlias() {
        return this.alias;
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
    public List<LayerReferencesUser> getListOfLayerReferencesUser() {
        return this.listOfLayerReferencesUser;
    } 

    public Layer getLayer() {
        return this.layer;
    } 

    public List<LayerReferencesDefault> getListOfLayerReferencesDefault() {
        return this.listOfLayerReferencesDefault;
    } 


}