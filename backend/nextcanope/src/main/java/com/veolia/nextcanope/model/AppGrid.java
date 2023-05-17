/*
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;

import org.locationtech.jts.geom.Geometry;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * JPA entity class for "AppGrid"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="app_grid", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class AppGrid implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="geom", length=2147483647)
	@JsonProperty("geom")
    private Geometry geom ;

    @Column(name="agr_valid")
	@JsonProperty("agr_valid")
    private Boolean agrValid ;

    @Column(name="agr_ucre_id")
	@JsonProperty("agr_ucre_id")
    private Long agrUcreId ;

    @Column(name="agr_umod_id")
	@JsonProperty("agr_umod_id")
    private Long agrUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="agr_dcre")
	@JsonProperty("agr_dcre")
    private Date agrDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="agr_dmod")
	@JsonProperty("agr_dmod")
    private Date agrDmod ;


    //--- ENTITY LINKS ( RELATIONSHIP )

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="agr_umod_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users modifiedBy ; 


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="agr_ucre_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users createdBy ; 


    /**
     * Constructor
     */
    public AppGrid() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Long id ) {
        this.id = id ;
    }
    public Long getId() {
        return this.id;
    }

	public void setGeom( Geometry geom ) {
        this.geom = geom ;
    }

    public Geometry getGeom() {
        return this.geom;
    }

	public void setAgrValid( Boolean agrValid ) {
        this.agrValid = agrValid ;
    }

    public Boolean getAgrValid() {
        return this.agrValid;
    }

	public void setAgrUcreId( Long agrUcreId ) {
        this.agrUcreId = agrUcreId ;
    }

    public Long getAgrUcreId() {
        return this.agrUcreId;
    }

	public void setAgrUmodId( Long agrUmodId ) {
        this.agrUmodId = agrUmodId ;
    }

    public Long getAgrUmodId() {
        return this.agrUmodId;
    }

	public void setAgrDcre( Date agrDcre ) {
        this.agrDcre = agrDcre ;
    }

    public Date getAgrDcre() {
        return this.agrDcre;
    }

	public void setAgrDmod( Date agrDmod ) {
        this.agrDmod = agrDmod ;
    }

    public Date getAgrDmod() {
        return this.agrDmod;
    }

    //--- GETTERS FOR LINKS
    public Users getModifiedBy() {
        return this.modifiedBy;
    } 

    public Users getCreatedBy() {
        return this.createdBy;
    } 


}
