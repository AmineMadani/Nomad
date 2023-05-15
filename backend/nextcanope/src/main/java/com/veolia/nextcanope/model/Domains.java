/*
 * Created on 2023-05-12 ( 22:06:20 )
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import jakarta.persistence.*;

/**
 * JPA entity class for "Domains"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="domains", schema="nomad" )
public class Domains implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="dom_type", nullable=false, length=2147483647)
    private String domType ;

    @Column(name="dom_parent_id")
    private Long domParentId ;

    @Column(name="dom_short", length=2147483647)
    private String domShort ;

    @Column(name="dom_alias", length=2147483647)
    private String domAlias ;

    @Column(name="dom_ucre_id")
    private Integer domUcreId ;

    @Column(name="dom_umod_id")
    private Integer domUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="dom_dcre")
    private Date domDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="dom_dmod")
    private Date domDmod ;


    //--- ENTITY LINKS ( RELATIONSHIP )
    @ManyToOne
    @JoinColumn(name="dom_umod_id", referencedColumnName="id", insertable=false, updatable=false)
    private Users modifiedBy ; 

    @OneToMany(mappedBy="domains")
    private List<AssetType> listOfAssetType ; 

    @ManyToOne
    @JoinColumn(name="dom_ucre_id", referencedColumnName="id", insertable=false, updatable=false)
    private Users createdBy ; 

    @OneToMany(mappedBy="domains")
    private List<Domains> listOfDomains ; 

    @OneToMany(mappedBy="domains")
    private List<Tree> listOfTree ; 

    @OneToMany(mappedBy="domains")
    private List<Layer> listOfLayer ; 

    @ManyToOne
    @JoinColumn(name="dom_parent_id", referencedColumnName="id", insertable=false, updatable=false)
    private Domains domains ; 


    /**
     * Constructor
     */
    public Domains() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Long id ) {
        this.id = id ;
    }
    public Long getId() {
        return this.id;
    }

    public void setDomType( String domType ) {
        this.domType = domType ;
    }
    public String getDomType() {
        return this.domType;
    }

    public void setDomParentId( Long domParentId ) {
        this.domParentId = domParentId ;
    }
    public Long getDomParentId() {
        return this.domParentId;
    }

    public void setDomShort( String domShort ) {
        this.domShort = domShort ;
    }
    public String getDomShort() {
        return this.domShort;
    }

    public void setDomAlias( String domAlias ) {
        this.domAlias = domAlias ;
    }
    public String getDomAlias() {
        return this.domAlias;
    }

    public void setDomUcreId( Integer domUcreId ) {
        this.domUcreId = domUcreId ;
    }
    public Integer getDomUcreId() {
        return this.domUcreId;
    }

    public void setDomUmodId( Integer domUmodId ) {
        this.domUmodId = domUmodId ;
    }
    public Integer getDomUmodId() {
        return this.domUmodId;
    }

    public void setDomDcre( Date domDcre ) {
        this.domDcre = domDcre ;
    }
    public Date getDomDcre() {
        return this.domDcre;
    }

    public void setDomDmod( Date domDmod ) {
        this.domDmod = domDmod ;
    }
    public Date getDomDmod() {
        return this.domDmod;
    }

    //--- GETTERS FOR LINKS
    public Users getModifiedBy() {
        return this.modifiedBy;
    } 

    public List<AssetType> getListOfAssetType() {
        return this.listOfAssetType;
    } 

    public Users getCreatedBy() {
        return this.createdBy;
    } 

    public List<Domains> getListOfDomains() {
        return this.listOfDomains;
    } 

    public List<Tree> getListOfTree() {
        return this.listOfTree;
    } 

    public List<Layer> getListOfLayer() {
        return this.listOfLayer;
    } 

    public Domains getDomains() {
        return this.domains;
    } 


}
