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
 * JPA entity class for "LayerStyle"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="layer_style", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class LayerStyle implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="lse_code", nullable=false, length=2147483647)
	@JsonProperty("lse_code")
    private String lseCode ;

    @Column(name="syd_id", nullable=false)
	@JsonProperty("syd_id")
    private Long sydId ;

    @Column(name="lyr_id", nullable=false)
	@JsonProperty("lyr_id")
    private Long lyrId ;

    @Column(name="lse_ucre_id")
	@JsonProperty("lse_ucre_id")
    private Long lseUcreId ;

    @Column(name="lse_umod_id")
	@JsonProperty("lse_umod_id")
    private Long lseUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="lse_dcre")
	@JsonProperty("lse_dcre")
    private Date lseDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="lse_dmod")
	@JsonProperty("lse_dmod")
    private Date lseDmod ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="lse_ddel")
	@JsonProperty("lse_ddel")
    private Date lseDdel ;


    //--- ENTITY LINKS ( RELATIONSHIP )

    @ManyToOne
    @JoinColumn(name="lse_umod_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users modifiedBy ; 


    @ManyToOne
    @JoinColumn(name="lyr_id", referencedColumnName="id", insertable=false, updatable=false)
    private Layer layer ; 


    @ManyToOne
    @JoinColumn(name="syd_id", referencedColumnName="id", insertable=false, updatable=false)
    private StyleDefinition styleDefinition ; 


    @ManyToOne
    @JoinColumn(name="lse_ucre_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users createdBy ; 


    @OneToMany(mappedBy="layerStyle")
    private List<LayerStyleCustom> listOfLayerStyleCustom ; 


    /**
     * Constructor
     */
    public LayerStyle() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Long id ) {
        this.id = id ;
    }
    public Long getId() {
        return this.id;
    }

	public void setLseCode( String lseCode ) {
        this.lseCode = lseCode ;
    }

    public String getLseCode() {
        return this.lseCode;
    }

	public void setSydId( Long sydId ) {
        this.sydId = sydId ;
    }

    public Long getSydId() {
        return this.sydId;
    }

	public void setLyrId( Long lyrId ) {
        this.lyrId = lyrId ;
    }

    public Long getLyrId() {
        return this.lyrId;
    }

	public void setLseUcreId( Long lseUcreId ) {
        this.lseUcreId = lseUcreId ;
    }

    public Long getLseUcreId() {
        return this.lseUcreId;
    }

	public void setLseUmodId( Long lseUmodId ) {
        this.lseUmodId = lseUmodId ;
    }

    public Long getLseUmodId() {
        return this.lseUmodId;
    }

	public void setLseDcre( Date lseDcre ) {
        this.lseDcre = lseDcre ;
    }

    public Date getLseDcre() {
        return this.lseDcre;
    }

	public void setLseDmod( Date lseDmod ) {
        this.lseDmod = lseDmod ;
    }

    public Date getLseDmod() {
        return this.lseDmod;
    }

	public void setLseDdel( Date lseDdel ) {
        this.lseDdel = lseDdel ;
    }

    public Date getLseDdel() {
        return this.lseDdel;
    }

    //--- GETTERS FOR LINKS
    public Users getModifiedBy() {
        return this.modifiedBy;
    } 

    public Layer getLayer() {
        return this.layer;
    } 

    public StyleDefinition getStyleDefinition() {
        return this.styleDefinition;
    } 

    public Users getCreatedBy() {
        return this.createdBy;
    } 

    public List<LayerStyleCustom> getListOfLayerStyleCustom() {
        return this.listOfLayerStyleCustom;
    } 


}
