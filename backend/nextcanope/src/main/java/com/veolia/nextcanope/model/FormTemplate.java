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
 * JPA entity class for "FormTemplate"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="form_template", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class FormTemplate implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY ---\\
        @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
private Long id;

    //--- ENTITY DATA FIELDS ---\\
    @Column(name="fte_code", nullable=false, length=2147483647)
    @JsonProperty("fte_code")
    private String fteCode;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="fte_dcre")
    @CreationTimestamp
    @JsonProperty("fte_dcre")
    private Date fteDcre;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="fte_dmod")
    @UpdateTimestamp
    @JsonProperty("fte_dmod")
    private Date fteDmod;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="fte_ddel")
    @JsonProperty("fte_ddel")
    private Date deletedAt;


    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @ManyToOne
    @JoinColumn(name="fdn_id", referencedColumnName="id")
    private FormDefinition formDefinition;

    @ManyToOne
    @JoinColumn(name="fte_umod_id", referencedColumnName="id")
	@JsonIgnore
    private Users modifiedBy;

    @OneToMany(mappedBy="formTemplate")
    @Fetch(value = FetchMode.SUBSELECT)
    private List<FormTemplateCustom> listOfFormTemplateCustom;

    @ManyToOne
    @JoinColumn(name="fte_ucre_id", referencedColumnName="id")
	@JsonIgnore
    private Users createdBy;

    /**
     * Constructor
     */
    public FormTemplate() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS ---\\
    public Long getId() {
        return this.id;
    }

    public void setId( Long id ) {
        this.id = id ;
    }

    public String getFteCode() {
        return this.fteCode;
    }

	public void setFteCode( String fteCode ) {
        this.fteCode = fteCode ;
    }

    public Date getFteDcre() {
        return this.fteDcre;
    }

	public void setFteDcre( Date fteDcre ) {
        this.fteDcre = fteDcre ;
    }

    public Date getFteDmod() {
        return this.fteDmod;
    }

	public void setFteDmod( Date fteDmod ) {
        this.fteDmod = fteDmod ;
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
    public FormDefinition getFormDefinition() {
        return this.formDefinition;
    }

    public void setFormDefinition(FormDefinition formDefinition) {
        this.formDefinition = formDefinition;
    }

    public Users getModifiedBy() {
        return this.modifiedBy;
    }

    public void setModifiedBy(Users modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public List<FormTemplateCustom> getListOfFormTemplateCustom() {
        if (this.listOfFormTemplateCustom != null) {
            return this.listOfFormTemplateCustom.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<FormTemplateCustom> getListOfFormTemplateCustomWithDeleted() {
        return this.listOfFormTemplateCustom;
    }

    public void setListOfFormTemplateCustom(List<FormTemplateCustom> listOfFormTemplateCustom) {
        this.listOfFormTemplateCustom = listOfFormTemplateCustom;
    }

    public Users getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(Users createdBy) {
        this.createdBy = createdBy;
    }

}
