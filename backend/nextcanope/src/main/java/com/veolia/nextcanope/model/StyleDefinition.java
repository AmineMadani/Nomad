/*
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Date;
import java.util.List;
import jakarta.persistence.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import java.util.stream.Collectors;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


/**
 * JPA entity class for "StyleDefinition"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="style_definition", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class StyleDefinition implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY ---\\
        @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
private Long id;

    //--- ENTITY DATA FIELDS ---\\
    @Column(name="syd_code", nullable=false, length=2147483647)
    @JsonProperty("syd_code")
    private String sydCode;

    @Column(name="syd_definition", nullable=false, length=2147483647)
    @JsonProperty("syd_definition")
    private String sydDefinition;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="syd_dcre")
    @CreationTimestamp
    @JsonProperty("syd_dcre")
    private Date sydDcre;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="syd_dmod")
    @UpdateTimestamp
    @JsonProperty("syd_dmod")
    private Date sydDmod;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="syd_ddel")
    @JsonProperty("syd_ddel")
    private Date deletedAt;


    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @ManyToOne
    @JoinColumn(name="syd_umod_id", referencedColumnName="id")
	@JsonIgnore
    private Users modifiedBy;

    @OneToMany(mappedBy="styleDefinition")
    @Fetch(value = FetchMode.SUBSELECT)
    private List<LayerStyleCustom> listOfLayerStyleCustom;

    @ManyToOne
    @JoinColumn(name="syd_ucre_id", referencedColumnName="id")
	@JsonIgnore
    private Users createdBy;

    @OneToMany(cascade = CascadeType.ALL, mappedBy="styleDefinition")
    @Fetch(value = FetchMode.SUBSELECT)
    private List<StyleImage> listOfStyleImage;

    @OneToMany(mappedBy="styleDefinition")
    @Fetch(value = FetchMode.SUBSELECT)
    private List<LayerStyle> listOfLayerStyle;

    /**
     * Constructor
     */
    public StyleDefinition() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS ---\\
    public Long getId() {
        return this.id;
    }

    public void setId( Long id ) {
        this.id = id ;
    }

    public String getSydCode() {
        return this.sydCode;
    }

	public void setSydCode( String sydCode ) {
        this.sydCode = sydCode ;
    }

    public String getSydDefinition() {
        return this.sydDefinition;
    }

	public void setSydDefinition( String sydDefinition ) {
        this.sydDefinition = sydDefinition ;
    }

    public Date getSydDcre() {
        return this.sydDcre;
    }

	public void setSydDcre( Date sydDcre ) {
        this.sydDcre = sydDcre ;
    }

    public Date getSydDmod() {
        return this.sydDmod;
    }

	public void setSydDmod( Date sydDmod ) {
        this.sydDmod = sydDmod ;
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
    public Users getModifiedBy() {
        return this.modifiedBy;
    }

    public void setModifiedBy(Users modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public List<LayerStyleCustom> getListOfLayerStyleCustom() {
        if (this.listOfLayerStyleCustom != null) {
            return this.listOfLayerStyleCustom.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<LayerStyleCustom> getListOfLayerStyleCustomWithDeleted() {
        return this.listOfLayerStyleCustom;
    }

    public void setListOfLayerStyleCustom(List<LayerStyleCustom> listOfLayerStyleCustom) {
        this.listOfLayerStyleCustom = listOfLayerStyleCustom;
    }

    public Users getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(Users createdBy) {
        this.createdBy = createdBy;
    }

    public List<StyleImage> getListOfStyleImage() {
        if (this.listOfStyleImage != null) {
            return this.listOfStyleImage.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<StyleImage> getListOfStyleImageWithDeleted() {
        return this.listOfStyleImage;
    }

    public void setListOfStyleImage(List<StyleImage> listOfStyleImage) {
        this.listOfStyleImage = listOfStyleImage;
    }

    public List<LayerStyle> getListOfLayerStyle() {
        if (this.listOfLayerStyle != null) {
            return this.listOfLayerStyle.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<LayerStyle> getListOfLayerStyleWithDeleted() {
        return this.listOfLayerStyle;
    }

    public void setListOfLayerStyle(List<LayerStyle> listOfLayerStyle) {
        this.listOfLayerStyle = listOfLayerStyle;
    }

}
