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
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


/**
 * JPA entity class for "LayerReferencesDefault"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="layer_references_default", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class LayerReferencesDefault implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY ---\\
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id;

    //--- ENTITY DATA FIELDS ---\\
    @Column(name="lrd_position", nullable=false)
    @JsonProperty("lrd_position")
    private Integer lrdPosition;

    @Column(name="lrd_section", length=2147483647)
    @JsonProperty("lrd_section")
    private String lrdSection;

    @Column(name="lrd_isvisible")
    @JsonProperty("lrd_isvisible")
    private Boolean lrdIsvisible;

    @Column(name="lrd_display_type", nullable=false, length=2147483647)
    @JsonProperty("lrd_display_type")
    private String lrdDisplayType;

    @Column(name="lrd_valid")
    @JsonProperty("lrd_valid")
    private Boolean lrdValid;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="lrd_dcre")
    @CreationTimestamp
    @JsonProperty("lrd_dcre")
    private Date lrdDcre;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="lrd_dmod")
    @UpdateTimestamp
    @JsonProperty("lrd_dmod")
    private Date lrdDmod;


    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="lrd_umod_id", referencedColumnName="id")
	@JsonIgnore
    private Users modifiedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="lrd_ucre_id", referencedColumnName="id")
	@JsonIgnore
    private Users createdBy;

    @ManyToOne
    @JoinColumn(name="lrd_id", referencedColumnName="id")
    private LayerReferences layerReferences;

    /**
     * Constructor
     */
    public LayerReferencesDefault() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS ---\\
    public Long getId() {
        return this.id;
    }

    public void setId( Long id ) {
        this.id = id ;
    }

    public Integer getLrdPosition() {
        return this.lrdPosition;
    }

	public void setLrdPosition( Integer lrdPosition ) {
        this.lrdPosition = lrdPosition ;
    }

    public String getLrdSection() {
        return this.lrdSection;
    }

	public void setLrdSection( String lrdSection ) {
        this.lrdSection = lrdSection ;
    }

    public Boolean getLrdIsvisible() {
        return this.lrdIsvisible;
    }

	public void setLrdIsvisible( Boolean lrdIsvisible ) {
        this.lrdIsvisible = lrdIsvisible ;
    }

    public String getLrdDisplayType() {
        return this.lrdDisplayType;
    }

	public void setLrdDisplayType( String lrdDisplayType ) {
        this.lrdDisplayType = lrdDisplayType ;
    }

    public Boolean getLrdValid() {
        return this.lrdValid;
    }

	public void setLrdValid( Boolean lrdValid ) {
        this.lrdValid = lrdValid ;
    }

    public Date getLrdDcre() {
        return this.lrdDcre;
    }

	public void setLrdDcre( Date lrdDcre ) {
        this.lrdDcre = lrdDcre ;
    }

    public Date getLrdDmod() {
        return this.lrdDmod;
    }

	public void setLrdDmod( Date lrdDmod ) {
        this.lrdDmod = lrdDmod ;
    }

    //--- GETTERS AND SETTERS FOR LINKS ---\\
    public Users getModifiedBy() {
        return this.modifiedBy;
    }

    public void setModifiedBy(Users modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public Users getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(Users createdBy) {
        this.createdBy = createdBy;
    }

    public LayerReferences getLayerReferences() {
        return this.layerReferences;
    }

    public void setLayerReferences(LayerReferences layerReferences) {
        this.layerReferences = layerReferences;
    }

}
