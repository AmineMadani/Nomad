/*
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Date;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.CreationTimestamp;


/**
 * JPA entity class for "Basemaps"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="basemaps", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class Basemaps implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY ---\\
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id;

    //--- ENTITY DATA FIELDS ---\\
    @Column(name="map_slabel", length=2147483647)
    @JsonProperty("map_slabel")
    private String mapSlabel;

    @Column(name="map_llabel", length=2147483647)
    @JsonProperty("map_llabel")
    private String mapLlabel;

    @Column(name="map_type", length=2147483647)
    @JsonProperty("map_type")
    private String mapType;

    @Column(name="map_url", length=2147483647)
    @JsonProperty("map_url")
    private String mapUrl;

    @Column(name="map_layer", length=2147483647)
    @JsonProperty("map_layer")
    private String mapLayer;

    @Column(name="map_matrixset", length=2147483647)
    @JsonProperty("map_matrixset")
    private String mapMatrixset;

    @Column(name="map_format", length=2147483647)
    @JsonProperty("map_format")
    private String mapFormat;

    @Column(name="map_projection", length=2147483647)
    @JsonProperty("map_projection")
    private String mapProjection;

    @Column(name="map_tilegrid", length=2147483647)
    @JsonProperty("map_tilegrid")
    private String mapTilegrid;

    @Column(name="map_style", length=2147483647)
    @JsonProperty("map_style")
    private String mapStyle;

    @Column(name="map_attributions", length=2147483647)
    @JsonProperty("map_attributions")
    private String mapAttributions;

    @Column(name="map_default")
    @JsonProperty("map_default")
    private Boolean mapDefault;

    @Column(name="map_display")
    @JsonProperty("map_display")
    private Boolean mapDisplay;

    @Lob
    @Column(name="map_thumbnail")
    @JsonProperty("map_thumbnail")
    private byte[] mapThumbnail;

    @Column(name="map_valid")
    @JsonProperty("map_valid")
    private Boolean mapValid;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="map_dcre")
    @CreationTimestamp
    @JsonProperty("map_dcre")
    private Date mapDcre;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="map_dmod")
    @UpdateTimestamp
    @JsonProperty("map_dmod")
    private Date mapDmod;


    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="map_ucre_id", referencedColumnName="id")
	@JsonIgnore
    private Users createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="map_umod_id", referencedColumnName="id")
	@JsonIgnore
    private Users modifiedBy;

    /**
     * Constructor
     */
    public Basemaps() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS ---\\
    public Long getId() {
        return this.id;
    }

    public void setId( Long id ) {
        this.id = id ;
    }

    public String getMapSlabel() {
        return this.mapSlabel;
    }

	public void setMapSlabel( String mapSlabel ) {
        this.mapSlabel = mapSlabel ;
    }

    public String getMapLlabel() {
        return this.mapLlabel;
    }

	public void setMapLlabel( String mapLlabel ) {
        this.mapLlabel = mapLlabel ;
    }

    public String getMapType() {
        return this.mapType;
    }

	public void setMapType( String mapType ) {
        this.mapType = mapType ;
    }

    public String getMapUrl() {
        return this.mapUrl;
    }

	public void setMapUrl( String mapUrl ) {
        this.mapUrl = mapUrl ;
    }

    public String getMapLayer() {
        return this.mapLayer;
    }

	public void setMapLayer( String mapLayer ) {
        this.mapLayer = mapLayer ;
    }

    public String getMapMatrixset() {
        return this.mapMatrixset;
    }

	public void setMapMatrixset( String mapMatrixset ) {
        this.mapMatrixset = mapMatrixset ;
    }

    public String getMapFormat() {
        return this.mapFormat;
    }

	public void setMapFormat( String mapFormat ) {
        this.mapFormat = mapFormat ;
    }

    public String getMapProjection() {
        return this.mapProjection;
    }

	public void setMapProjection( String mapProjection ) {
        this.mapProjection = mapProjection ;
    }

    public String getMapTilegrid() {
        return this.mapTilegrid;
    }

	public void setMapTilegrid( String mapTilegrid ) {
        this.mapTilegrid = mapTilegrid ;
    }

    public String getMapStyle() {
        return this.mapStyle;
    }

	public void setMapStyle( String mapStyle ) {
        this.mapStyle = mapStyle ;
    }

    public String getMapAttributions() {
        return this.mapAttributions;
    }

	public void setMapAttributions( String mapAttributions ) {
        this.mapAttributions = mapAttributions ;
    }

    public Boolean getMapDefault() {
        return this.mapDefault;
    }

	public void setMapDefault( Boolean mapDefault ) {
        this.mapDefault = mapDefault ;
    }

    public Boolean getMapDisplay() {
        return this.mapDisplay;
    }

	public void setMapDisplay( Boolean mapDisplay ) {
        this.mapDisplay = mapDisplay ;
    }

    public byte[] getMapThumbnail() {
        return this.mapThumbnail;
    }

	public void setMapThumbnail( byte[] mapThumbnail ) {
        this.mapThumbnail = mapThumbnail ;
    }

    public Boolean getMapValid() {
        return this.mapValid;
    }

	public void setMapValid( Boolean mapValid ) {
        this.mapValid = mapValid ;
    }

    public Date getMapDcre() {
        return this.mapDcre;
    }

	public void setMapDcre( Date mapDcre ) {
        this.mapDcre = mapDcre ;
    }

    public Date getMapDmod() {
        return this.mapDmod;
    }

	public void setMapDmod( Date mapDmod ) {
        this.mapDmod = mapDmod ;
    }

    //--- GETTERS AND SETTERS FOR LINKS ---\\
    public Users getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(Users createdBy) {
        this.createdBy = createdBy;
    }

    public Users getModifiedBy() {
        return this.modifiedBy;
    }

    public void setModifiedBy(Users modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

}
