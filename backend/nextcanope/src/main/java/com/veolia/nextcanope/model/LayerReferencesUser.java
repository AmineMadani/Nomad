/*
 * Created on 2023-05-12 ( 22:06:20 )
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
@Table(name="layer_references_user", schema="nomad" )
public class LayerReferencesUser implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="lrf_id", nullable=false)
    private Long lrfId ;

    @Column(name="lru_user_id", nullable=false)
    private Long lruUserId ;

    @Column(name="lru_position", nullable=false)
    private Integer lruPosition ;

    @Column(name="lru_display_type", nullable=false, length=2147483647)
    private String lruDisplayType ;

    @Column(name="lru_section", length=2147483647)
    private String lruSection ;

    @Column(name="lru_isvisible")
    private Boolean lruIsvisible ;

    @Column(name="lru_ucre_id")
    private Long lruUcreId ;

    @Column(name="lru_umod_id")
    private Long lruUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="lru_dcre")
    private Date lruDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="lru_dmod")
    private Date lruDmod ;


    //--- ENTITY LINKS ( RELATIONSHIP )
    @ManyToOne
    @JoinColumn(name="lrf_id", referencedColumnName="id", insertable=false, updatable=false)
    private LayerReferences layerReferences ; 

    @ManyToOne
    @JoinColumn(name="lru_umod_id", referencedColumnName="id", insertable=false, updatable=false)
    private Users modifiedBy ; 

    @ManyToOne
    @JoinColumn(name="lru_user_id", referencedColumnName="id", insertable=false, updatable=false)
    private Users user ; 

    @ManyToOne
    @JoinColumn(name="lru_ucre_id", referencedColumnName="id", insertable=false, updatable=false)
    private Users createdBy ; 


    /**
     * Constructor
     */
    public LayerReferencesUser() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Long id ) {
        this.id = id ;
    }
    public Long getId() {
        return this.id;
    }

    public void setLrfId( Long lrfId ) {
        this.lrfId = lrfId ;
    }
    public Long getLrfId() {
        return this.lrfId;
    }

    public void setLruUserId( Long lruUserId ) {
        this.lruUserId = lruUserId ;
    }
    public Long getLruUserId() {
        return this.lruUserId;
    }

    public void setLruPosition( Integer lruPosition ) {
        this.lruPosition = lruPosition ;
    }
    public Integer getLruPosition() {
        return this.lruPosition;
    }

    public void setLruDisplayType( String lruDisplayType ) {
        this.lruDisplayType = lruDisplayType ;
    }
    public String getLruDisplayType() {
        return this.lruDisplayType;
    }

    public void setLruSection( String lruSection ) {
        this.lruSection = lruSection ;
    }
    public String getLruSection() {
        return this.lruSection;
    }

    public void setLruIsvisible( Boolean lruIsvisible ) {
        this.lruIsvisible = lruIsvisible ;
    }
    public Boolean getLruIsvisible() {
        return this.lruIsvisible;
    }

    public void setLruUcreId( Long lruUcreId ) {
        this.lruUcreId = lruUcreId ;
    }
    public Long getLruUcreId() {
        return this.lruUcreId;
    }

    public void setLruUmodId( Long lruUmodId ) {
        this.lruUmodId = lruUmodId ;
    }
    public Long getLruUmodId() {
        return this.lruUmodId;
    }

    public void setLruDcre( Date lruDcre ) {
        this.lruDcre = lruDcre ;
    }
    public Date getLruDcre() {
        return this.lruDcre;
    }

    public void setLruDmod( Date lruDmod ) {
        this.lruDmod = lruDmod ;
    }
    public Date getLruDmod() {
        return this.lruDmod;
    }

    //--- GETTERS FOR LINKS
    public LayerReferences getLayerReferences() {
        return this.layerReferences;
    } 

    public Users getModifiedBy() {
        return this.modifiedBy;
    } 

    public Users getUser() {
        return this.user;
    } 

    public Users getCreatedBy() {
        return this.createdBy;
    } 


}
