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
 * JPA entity class for "UsrCtrPrf"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="usr_ctr_prf", schema="nomad" )
@IdClass(UsrCtrPrfId.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public class UsrCtrPrf implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY DATA FIELDS ---\\
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="usc_dcre")
    @CreationTimestamp
    @JsonProperty("usc_dcre")
    private Date uscDcre;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="usc_dmod")
    @UpdateTimestamp
    @JsonProperty("usc_dmod")
    private Date uscDmod;


    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @Id
    @ManyToOne
    @JoinColumn(name="ctr_id", referencedColumnName="id")
    private Contract contract;

    @Id
    @ManyToOne
    @JoinColumn(name="usr_id", referencedColumnName="id")
    private Users user;

    @ManyToOne
    @JoinColumn(name="prf_id", referencedColumnName="id")
    private Profile profile;

    @ManyToOne
    @JoinColumn(name="usc_ucre_id", referencedColumnName="id")
	@JsonIgnore
    private Users createdBy;

    @ManyToOne
    @JoinColumn(name="usc_umod_id", referencedColumnName="id")
    @JsonIgnore
    private Users modifiedBy;

    /**
     * Constructor
     */
    public UsrCtrPrf() {
		super();
    }

    //--- GETTERS & SETTERS FOR FIELDS ---\\
    public Date getUscDcre() {
        return this.uscDcre;
    }

	public void setUscDcre( Date uscDcre ) {
        this.uscDcre = uscDcre ;
    }

    public Date getUscDmod() {
        return this.uscDmod;
    }

	public void setUscDmod( Date uscDmod ) {
        this.uscDmod = uscDmod ;
    }

    //--- GETTERS AND SETTERS FOR LINKS ---\\
    public Users getModifiedBy() {
        return this.modifiedBy;
    }

    public void setModifiedBy(Users modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public Contract getContract() {
        return this.contract;
    }

    public void setContract(Contract contract) {
        this.contract = contract;
    }

    public Users getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(Users createdBy) {
        this.createdBy = createdBy;
    }

    public Profile getProfile() {
        return this.profile;
    }

    public void setProfile(Profile profile) {
        this.profile = profile;
    }

    public Users getUser() {
        return this.user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

}
