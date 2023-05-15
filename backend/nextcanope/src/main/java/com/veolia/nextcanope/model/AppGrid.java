/*
 * Created on 2023-05-12 ( 22:06:19 )
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
@Table(name="app_grid", schema="nomad" )
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

    @Column(name="map_ucre_id")
    private Long mapUcreId ;

    @Column(name="map_umod_id")
    private Long mapUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="map_dcre")
    private Date mapDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="map_dmod")
    private Date mapDmod ;


    //--- ENTITY LINKS ( RELATIONSHIP )
    @ManyToOne
    @JoinColumn(name="map_umod_id", referencedColumnName="id", insertable=false, updatable=false)
    private Users modifiedBy ; 

    @ManyToOne
    @JoinColumn(name="map_ucre_id", referencedColumnName="id", insertable=false, updatable=false)
    private Users createdBy ; 


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

    public void setMapUcreId( Long mapUcreId ) {
        this.mapUcreId = mapUcreId ;
    }
    public Long getMapUcreId() {
        return this.mapUcreId;
    }

    public void setMapUmodId( Long mapUmodId ) {
        this.mapUmodId = mapUmodId ;
    }
    public Long getMapUmodId() {
        return this.mapUmodId;
    }

    public void setMapDcre( Date mapDcre ) {
        this.mapDcre = mapDcre ;
    }
    public Date getMapDcre() {
        return this.mapDcre;
    }

    public void setMapDmod( Date mapDmod ) {
        this.mapDmod = mapDmod ;
    }
    public Date getMapDmod() {
        return this.mapDmod;
    }

    //--- GETTERS FOR LINKS
    public Users getModifiedBy() {
        return this.modifiedBy;
    } 

    public Users getCreatedBy() {
        return this.createdBy;
    } 


}
