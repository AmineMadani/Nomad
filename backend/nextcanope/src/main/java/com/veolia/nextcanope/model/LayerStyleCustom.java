/*
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * JPA entity class for "LayerStyleCustom"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="layer_style_custom", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class LayerStyleCustom implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="lse_id", nullable=false)
	@JsonProperty("lse_id")
    private Long lseId ;

    @Column(name="usr_id", nullable=false)
	@JsonProperty("usr_id")
    private Long usrId ;

    @Column(name="syd_id", nullable=false)
	@JsonProperty("syd_id")
    private Long sydId ;

    @Column(name="lsc_ucre_id")
	@JsonProperty("lsc_ucre_id")
    private Long lscUcreId ;

    @Column(name="lsc_umod_id")
	@JsonProperty("lsc_umod_id")
    private Long lscUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="lsc_dcre")
	@JsonProperty("lsc_dcre")
    private Date lscDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="lsc_dmod")
	@JsonProperty("lsc_dmod")
    private Date lscDmod ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="lsc_ddel")
	@JsonProperty("lsc_ddel")
    private Date lscDdel ;


    //--- ENTITY LINKS ( RELATIONSHIP )

    @ManyToOne
    @JoinColumn(name="lse_id", referencedColumnName="id", insertable=false, updatable=false)
    private LayerStyle layerStyle ; 


    @ManyToOne
    @JoinColumn(name="syd_id", referencedColumnName="id", insertable=false, updatable=false)
    private StyleDefinition styleDefinition ; 


    @ManyToOne
    @JoinColumn(name="lsc_umod_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users modifiedBy ; 


    @ManyToOne
    @JoinColumn(name="usr_id", referencedColumnName="id", insertable=false, updatable=false)
    private Users users ; 


    @ManyToOne
    @JoinColumn(name="lsc_ucre_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users createdBy ; 


    /**
     * Constructor
     */
    public LayerStyleCustom() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Long id ) {
        this.id = id ;
    }
    public Long getId() {
        return this.id;
    }

	public void setLseId( Long lseId ) {
        this.lseId = lseId ;
    }

    public Long getLseId() {
        return this.lseId;
    }

	public void setUsrId( Long usrId ) {
        this.usrId = usrId ;
    }

    public Long getUsrId() {
        return this.usrId;
    }

	public void setSydId( Long sydId ) {
        this.sydId = sydId ;
    }

    public Long getSydId() {
        return this.sydId;
    }

	public void setLscUcreId( Long lscUcreId ) {
        this.lscUcreId = lscUcreId ;
    }

    public Long getLscUcreId() {
        return this.lscUcreId;
    }

	public void setLscUmodId( Long lscUmodId ) {
        this.lscUmodId = lscUmodId ;
    }

    public Long getLscUmodId() {
        return this.lscUmodId;
    }

	public void setLscDcre( Date lscDcre ) {
        this.lscDcre = lscDcre ;
    }

    public Date getLscDcre() {
        return this.lscDcre;
    }

	public void setLscDmod( Date lscDmod ) {
        this.lscDmod = lscDmod ;
    }

    public Date getLscDmod() {
        return this.lscDmod;
    }

	public void setLscDdel( Date lscDdel ) {
        this.lscDdel = lscDdel ;
    }

    public Date getLscDdel() {
        return this.lscDdel;
    }

    //--- GETTERS FOR LINKS
    public LayerStyle getLayerStyle() {
        return this.layerStyle;
    } 

    public StyleDefinition getStyleDefinition() {
        return this.styleDefinition;
    } 

    public Users getModifiedBy() {
        return this.modifiedBy;
    } 

    public Users getUsers() {
        return this.users;
    } 

    public Users getCreatedBy() {
        return this.createdBy;
    } 


}