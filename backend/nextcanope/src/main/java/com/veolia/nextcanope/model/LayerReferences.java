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
 * JPA entity class for "LayerReferences"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="layer_references", schema="nomad" )
public class LayerReferences implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="lyr_id", nullable=false)
    private Long lyrId ;

    @Column(name="lrf_reference_key", nullable=false, length=2147483647)
    private String lrfReferenceKey ;

    @Column(name="lrf_slabel", length=2147483647)
    private String lrfSlabel ;

    @Column(name="lrf_ucre_id")
    private Long lrfUcreId ;

    @Column(name="lrf_llabel", length=2147483647)
    private String lrfLlabel ;

    @Column(name="lrf_umod_id")
    private Long lrfUmodId ;

    @Column(name="lrf_valid")
    private Boolean lrfValid ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="lrf_dcre")
    private Date lrfDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="lrf_dmod")
    private Date lrfDmod ;


    //--- ENTITY LINKS ( RELATIONSHIP )

    @ManyToOne
    @JoinColumn(name="lrf_umod_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users modifiedBy ; 


    @OneToMany(mappedBy="layerReferences")
    private List<LayerReferencesDefault> listOfLayerReferencesDefault ; 


    @ManyToOne
    @JoinColumn(name="lyr_id", referencedColumnName="id", insertable=false, updatable=false)
    private Layer layer ; 


    @OneToMany(mappedBy="layerReferences")
    private List<LayerReferencesUser> listOfLayerReferencesUser ; 


    @ManyToOne
    @JoinColumn(name="lrf_ucre_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users createdBy ; 


    /**
     * Constructor
     */
    public LayerReferences() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Long id ) {
        this.id = id ;
    }
    public Long getId() {
        return this.id;
    }

    public void setLyrId( Long lyrId ) {
        this.lyrId = lyrId ;
    }
    public Long getLyrId() {
        return this.lyrId;
    }

    public void setLrfReferenceKey( String lrfReferenceKey ) {
        this.lrfReferenceKey = lrfReferenceKey ;
    }
    public String getLrfReferenceKey() {
        return this.lrfReferenceKey;
    }

    public void setLrfSlabel( String lrfSlabel ) {
        this.lrfSlabel = lrfSlabel ;
    }
    public String getLrfSlabel() {
        return this.lrfSlabel;
    }

    public void setLrfUcreId( Long lrfUcreId ) {
        this.lrfUcreId = lrfUcreId ;
    }
    public Long getLrfUcreId() {
        return this.lrfUcreId;
    }

    public void setLrfLlabel( String lrfLlabel ) {
        this.lrfLlabel = lrfLlabel ;
    }
    public String getLrfLlabel() {
        return this.lrfLlabel;
    }

    public void setLrfUmodId( Long lrfUmodId ) {
        this.lrfUmodId = lrfUmodId ;
    }
    public Long getLrfUmodId() {
        return this.lrfUmodId;
    }

    public void setLrfValid( Boolean lrfValid ) {
        this.lrfValid = lrfValid ;
    }
    public Boolean getLrfValid() {
        return this.lrfValid;
    }

    public void setLrfDcre( Date lrfDcre ) {
        this.lrfDcre = lrfDcre ;
    }
    public Date getLrfDcre() {
        return this.lrfDcre;
    }

    public void setLrfDmod( Date lrfDmod ) {
        this.lrfDmod = lrfDmod ;
    }
    public Date getLrfDmod() {
        return this.lrfDmod;
    }

    //--- GETTERS FOR LINKS
    public Users getModifiedBy() {
        return this.modifiedBy;
    } 

    public List<LayerReferencesDefault> getListOfLayerReferencesDefault() {
        return this.listOfLayerReferencesDefault;
    } 

    public Layer getLayer() {
        return this.layer;
    } 

    public List<LayerReferencesUser> getListOfLayerReferencesUser() {
        return this.listOfLayerReferencesUser;
    } 

    public Users getCreatedBy() {
        return this.createdBy;
    } 


}
