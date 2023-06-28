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
 * JPA entity class for "Layer"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="layer", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class Layer implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="lyr_num_order")
	@JsonProperty("lyr_num_order")
    private Integer lyrNumOrder ;

    @Column(name="dom_id")
	@JsonProperty("dom_id")
    private Long domId ;

    @Column(name="ast_id")
	@JsonProperty("ast_id")
    private Long astId ;

    @Column(name="lyr_table_name", nullable=false, length=2147483647)
	@JsonProperty("lyr_table_name")
    private String lyrTableName ;

    @Column(name="lyr_geom_column_name", nullable=false, length=2147483647)
	@JsonProperty("lyr_geom_column_name")
    private String lyrGeomColumnName ;

    @Column(name="lyr_uuid_column_name", nullable=false, length=2147483647)
	@JsonProperty("lyr_uuid_column_name")
    private String lyrUuidColumnName ;

    @Column(name="lyr_geom_srid", nullable=false, length=2147483647)
	@JsonProperty("lyr_geom_srid")
    private String lyrGeomSrid ;

    @Column(name="lyr_slabel", length=2147483647)
	@JsonProperty("lyr_slabel")
    private String lyrSlabel ;

    @Column(name="lyr_llabel", length=2147483647)
	@JsonProperty("lyr_llabel")
    private String lyrLlabel ;

    @Column(name="lyr_valid")
	@JsonProperty("lyr_valid")
    private Boolean lyrValid ;

    @Column(name="lyr_display")
	@JsonProperty("lyr_display")
    private Boolean lyrDisplay ;

    @Column(name="lyr_ucre_id")
	@JsonProperty("lyr_ucre_id")
    private Long lyrUcreId ;

    @Column(name="lyr_umod_id")
	@JsonProperty("lyr_umod_id")
    private Long lyrUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="lyr_dcre")
	@JsonProperty("lyr_dcre")
    private Date lyrDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="lyr_dmod")
	@JsonProperty("lyr_dmod")
    private Date lyrDmod ;


    //--- ENTITY LINKS ( RELATIONSHIP )

    @ManyToOne
    @JoinColumn(name="dom_id", referencedColumnName="id", insertable=false, updatable=false)
    private Domains domains ; 


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="lyr_umod_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users modifiedBy ; 


    @OneToMany(mappedBy="layer")
    private List<LayerStyle> listOfLayerStyle ; 


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="lyr_ucre_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users createdBy ; 


    @ManyToOne
    @JoinColumn(name="ast_id", referencedColumnName="id", insertable=false, updatable=false)
    private AssetType assetType ; 


    @OneToMany(mappedBy="layer")
    private List<Asset> listOfAsset ; 


    @OneToMany(mappedBy="layer")
    private List<LayerReferences> listOfLayerReferences ; 


    @OneToMany(mappedBy="layer")
    private List<Tree> listOfTree ; 


    /**
     * Constructor
     */
    public Layer() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Long id ) {
        this.id = id ;
    }
    public Long getId() {
        return this.id;
    }

	public void setLyrNumOrder( Integer lyrNumOrder ) {
        this.lyrNumOrder = lyrNumOrder ;
    }

    public Integer getLyrNumOrder() {
        return this.lyrNumOrder;
    }

	public void setDomId( Long domId ) {
        this.domId = domId ;
    }

    public Long getDomId() {
        return this.domId;
    }

	public void setAstId( Long astId ) {
        this.astId = astId ;
    }

    public Long getAstId() {
        return this.astId;
    }

	public void setLyrTableName( String lyrTableName ) {
        this.lyrTableName = lyrTableName ;
    }

    public String getLyrTableName() {
        return this.lyrTableName;
    }

	public void setLyrGeomColumnName( String lyrGeomColumnName ) {
        this.lyrGeomColumnName = lyrGeomColumnName ;
    }

    public String getLyrGeomColumnName() {
        return this.lyrGeomColumnName;
    }

	public void setLyrUuidColumnName( String lyrUuidColumnName ) {
        this.lyrUuidColumnName = lyrUuidColumnName ;
    }

    public String getLyrUuidColumnName() {
        return this.lyrUuidColumnName;
    }

	public void setLyrGeomSrid( String lyrGeomSrid ) {
        this.lyrGeomSrid = lyrGeomSrid ;
    }

    public String getLyrGeomSrid() {
        return this.lyrGeomSrid;
    }

	public void setLyrSlabel( String lyrSlabel ) {
        this.lyrSlabel = lyrSlabel ;
    }

    public String getLyrSlabel() {
        return this.lyrSlabel;
    }

	public void setLyrLlabel( String lyrLlabel ) {
        this.lyrLlabel = lyrLlabel ;
    }

    public String getLyrLlabel() {
        return this.lyrLlabel;
    }

	public void setLyrValid( Boolean lyrValid ) {
        this.lyrValid = lyrValid ;
    }

    public Boolean getLyrValid() {
        return this.lyrValid;
    }

	public void setLyrDisplay( Boolean lyrDisplay ) {
        this.lyrDisplay = lyrDisplay ;
    }

    public Boolean getLyrDisplay() {
        return this.lyrDisplay;
    }

	public void setLyrUcreId( Long lyrUcreId ) {
        this.lyrUcreId = lyrUcreId ;
    }

    public Long getLyrUcreId() {
        return this.lyrUcreId;
    }

	public void setLyrUmodId( Long lyrUmodId ) {
        this.lyrUmodId = lyrUmodId ;
    }

    public Long getLyrUmodId() {
        return this.lyrUmodId;
    }

	public void setLyrDcre( Date lyrDcre ) {
        this.lyrDcre = lyrDcre ;
    }

    public Date getLyrDcre() {
        return this.lyrDcre;
    }

	public void setLyrDmod( Date lyrDmod ) {
        this.lyrDmod = lyrDmod ;
    }

    public Date getLyrDmod() {
        return this.lyrDmod;
    }

    //--- GETTERS FOR LINKS
    public Domains getDomains() {
        return this.domains;
    } 

    public Users getModifiedBy() {
        return this.modifiedBy;
    } 

    public List<LayerStyle> getListOfLayerStyle() {
        return this.listOfLayerStyle;
    } 

    public Users getCreatedBy() {
        return this.createdBy;
    } 

    public AssetType getAssetType() {
        return this.assetType;
    } 

    public List<Asset> getListOfAsset() {
        return this.listOfAsset;
    } 

    public List<LayerReferences> getListOfLayerReferences() {
        return this.listOfLayerReferences;
    } 

    public List<Tree> getListOfTree() {
        return this.listOfTree;
    } 


}
