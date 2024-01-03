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
 * JPA entity class for "OrgCtr"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="org_ctr", schema="nomad" )
@IdClass(OrgCtrId.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrgCtr implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY ---\\


    //--- ENTITY DATA FIELDS ---\\
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="orc_dcre")
    @CreationTimestamp
    @JsonProperty("orc_dcre")
    private Date orcDcre;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="orc_dmod")
    @UpdateTimestamp
    @JsonProperty("orc_dmod")
    private Date orcDmod;


    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @ManyToOne
    @JoinColumn(name="orc_ucre_id", referencedColumnName="id")
	@JsonIgnore
    private Users createdBy;

    @ManyToOne
    @JoinColumn(name="ctr_id", referencedColumnName="id")
    @Id
    private Contract contract;

    @ManyToOne
    @JoinColumn(name="org_id", referencedColumnName="id")
    @Id
    private OrganizationalUnit organizationalUnit;

    @ManyToOne
    @JoinColumn(name="orc_umod_id", referencedColumnName="id")
	@JsonIgnore
    private Users modifiedBy;

    /**
     * Constructor
     */
    public OrgCtr() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS ---\\
    public Date getOrcDcre() {
        return this.orcDcre;
    }

	public void setOrcDcre( Date orcDcre ) {
        this.orcDcre = orcDcre ;
    }

    public Date getOrcDmod() {
        return this.orcDmod;
    }

	public void setOrcDmod( Date orcDmod ) {
        this.orcDmod = orcDmod ;
    }

    //--- GETTERS AND SETTERS FOR LINKS ---\\
    public Users getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(Users createdBy) {
        this.createdBy = createdBy;
    }

    public Contract getContract() {
        return this.contract;
    }

    public void setContract(Contract contract) {
        this.contract = contract;
    }

    public OrganizationalUnit getOrganizationalUnit() {
        return this.organizationalUnit;
    }

    public void setOrganizationalUnit(OrganizationalUnit organizationalUnit) {
        this.organizationalUnit = organizationalUnit;
    }

    public Users getModifiedBy() {
        return this.modifiedBy;
    }

    public void setModifiedBy(Users modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

}
