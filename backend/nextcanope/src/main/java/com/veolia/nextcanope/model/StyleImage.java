/*
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.CreationTimestamp;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * JPA entity class for "StyleImage"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="style_image", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class StyleImage implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="syi_code", nullable=false, length=2147483647)
    @JsonProperty("syi_code")
    private String syiCode ;

    @Column(name="syi_source", nullable=false, length=2147483647)
    @JsonProperty("syi_source")
    private String syiSource ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="syi_dcre")
    @CreationTimestamp
    @JsonProperty("syi_dcre")
    private Date syiDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="syi_dmod")
    @UpdateTimestamp
    @JsonProperty("syi_dmod")
    private Date syiDmod ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="syi_ddel")
    @JsonProperty("syi_ddel")
    private Date deletedAt;

    //--- ENTITY LINKS ( RELATIONSHIP )
    @ManyToOne
    @JoinColumn(name="syi_ucre_id", referencedColumnName="id")
	@JsonIgnore
    private Users createdBy ; 

    @ManyToOne
    @JoinColumn(name="syi_umod_id", referencedColumnName="id")
	@JsonIgnore
    private Users modifiedBy ; 

    @ManyToOne
    @JoinColumn(name="syd_id", referencedColumnName="id")
    private StyleDefinition styleDefinition ; 


    /**
     * Constructor
     */
    public StyleImage() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Long id ) {
        this.id = id ;
    }
    public Long getId() {
        return this.id;
    }

	public void setSyiCode( String syiCode ) {
        this.syiCode = syiCode ;
    }

    public String getSyiCode() {
        return this.syiCode;
    }

	public void setSyiSource( String syiSource ) {
        this.syiSource = syiSource ;
    }

    public String getSyiSource() {
        return this.syiSource;
    }

	public void setSyiDcre( Date syiDcre ) {
        this.syiDcre = syiDcre ;
    }

    public Date getSyiDcre() {
        return this.syiDcre;
    }

	public void setSyiDmod( Date syiDmod ) {
        this.syiDmod = syiDmod ;
    }

    public Date getSyiDmod() {
        return this.syiDmod;
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

//--- GETTERS AND SETTERS FOR LINKS
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
        public StyleDefinition getStyleDefinition() {
        return this.styleDefinition;
    }
    
    public void setStyleDefinition(StyleDefinition styleDefinition) {
        this.styleDefinition = styleDefinition;
    }

}
