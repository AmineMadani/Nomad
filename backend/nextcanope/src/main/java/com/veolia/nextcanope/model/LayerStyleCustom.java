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

    //--- ENTITY PRIMARY KEY ---\\
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id;

    //--- ENTITY DATA FIELDS ---\\
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="lsc_dcre")
    @CreationTimestamp
    @JsonProperty("lsc_dcre")
    private Date lscDcre;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="lsc_dmod")
    @UpdateTimestamp
    @JsonProperty("lsc_dmod")
    private Date lscDmod;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="lsc_ddel")
    @JsonProperty("lsc_ddel")
    private Date deletedAt;


    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @ManyToOne
    @JoinColumn(name="lse_id", referencedColumnName="id")
    private LayerStyle layerStyle;

    @ManyToOne
    @JoinColumn(name="syd_id", referencedColumnName="id")
    private StyleDefinition styleDefinition;

    @ManyToOne
    @JoinColumn(name="lsc_umod_id", referencedColumnName="id")
	@JsonIgnore
    private Users modifiedBy;

    @ManyToOne
    @JoinColumn(name="usr_id", referencedColumnName="id")
    private Users users;

    @ManyToOne
    @JoinColumn(name="lsc_ucre_id", referencedColumnName="id")
	@JsonIgnore
    private Users createdBy;

    /**
     * Constructor
     */
    public LayerStyleCustom() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS ---\\
    public Long getId() {
        return this.id;
    }

    public void setId( Long id ) {
        this.id = id ;
    }

    public Date getLscDcre() {
        return this.lscDcre;
    }

	public void setLscDcre( Date lscDcre ) {
        this.lscDcre = lscDcre ;
    }

    public Date getLscDmod() {
        return this.lscDmod;
    }

	public void setLscDmod( Date lscDmod ) {
        this.lscDmod = lscDmod ;
    }

    public Date getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(Date deletedAt) {
        this.deletedAt = deletedAt;
    }

    public void markAsDeleted(Users user) {
        this.deletedAt = new Date();
        this.modifiedBy = user;
    }

    //--- GETTERS AND SETTERS FOR LINKS ---\\
    public LayerStyle getLayerStyle() {
        return this.layerStyle;
    }

    public void setLayerStyle(LayerStyle layerStyle) {
        this.layerStyle = layerStyle;
    }

    public StyleDefinition getStyleDefinition() {
        return this.styleDefinition;
    }

    public void setStyleDefinition(StyleDefinition styleDefinition) {
        this.styleDefinition = styleDefinition;
    }

    public Users getModifiedBy() {
        return this.modifiedBy;
    }

    public void setModifiedBy(Users modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public Users getUsers() {
        return this.users;
    }

    public void setUsers(Users users) {
        this.users = users;
    }

    public Users getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(Users createdBy) {
        this.createdBy = createdBy;
    }

}
