package com.veolia.nextcanope.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.locationtech.jts.geom.Geometry;

import java.util.Date;

/**
 * JPA entity class for "AssetType"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="asset_for_sig", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class AssetForSig {

    @SuppressWarnings("unused")
	private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY ---\\
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id;

    @Column(name="afs_geom", length=2147483647)
    @JsonProperty("afs_geom")
    private Geometry afsGeom;

    @Column(name="afs_informations", length=2147483647)
    @JsonProperty("afs_informations")
    private String afsInformations;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="afs_dcre")
    @CreationTimestamp
    @JsonProperty("afs_dcre")
    private Date afsDcre;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="afs_dmod")
    @UpdateTimestamp
    @JsonProperty("afs_dmod")
    private Date afsDmod;

    @Column(name="afs_cache_id", length=2147483647)
    @JsonProperty("afs_cache_id")
    private Long afsCacheId;

    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @ManyToOne
    @JoinColumn(name="lyr_id", referencedColumnName="id")
    private Layer layer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="afs_umod_id", referencedColumnName="id")
    @JsonIgnore
    private Users modifiedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="afs_ucre_id", referencedColumnName="id")
    @JsonIgnore
    private Users createdBy;

    /**
     * Constructor
     */
    public AssetForSig() {
        super();
    }

    //--- GETTERS & SETTERS FOR FIELDS ---\\
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Geometry getAfsGeom() {
        return afsGeom;
    }

    public void setAfsGeom(Geometry afsGeom) {
        this.afsGeom = afsGeom;
    }

    public String getAfsInformations() {
        return afsInformations;
    }

    public void setAfsInformations(String afsInformations) {
        this.afsInformations = afsInformations;
    }

    public Long getAfsCacheId() {
        return afsCacheId;
    }

    public void setAfsCacheId(Long afsCacheId) {
        this.afsCacheId = afsCacheId;
    }

    public Date getAfsDcre() {
        return afsDcre;
    }

    public void setAfsDcre(Date afsDcre) {
        this.afsDcre = afsDcre;
    }

    public Date getAfsDmod() {
        return afsDmod;
    }

    public void setAfsDmod(Date afsDmod) {
        this.afsDmod = afsDmod;
    }

    //--- GETTERS AND SETTERS FOR LINKS ---\\
    public Layer getLayer() {
        return layer;
    }

    public void setLayer(Layer layer) {
        this.layer = layer;
    }

    public Users getModifiedBy() {
        return modifiedBy;
    }

    public void setModifiedBy(Users modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public Users getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Users createdBy) {
        this.createdBy = createdBy;
    }
}
