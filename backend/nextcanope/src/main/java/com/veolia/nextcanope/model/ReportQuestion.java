package com.veolia.nextcanope.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name="report_question", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReportQuestion implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY ---\\
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id;

    //--- ENTITY DATA FIELDS ---\\
    @Column(name="rqn_code", nullable=false, length=2147483647)
    @JsonProperty("rqn_code")
    private String rqnCode;

    @Column(name="rqn_slabel", nullable=false, length=2147483647)
    @JsonProperty("rqn_slabel")
    private String rqnSlabel;

    @Column(name="rqn_llabel", nullable=false, length=2147483647)
    @JsonProperty("rqn_llabel")
    private String rqnLlabel;

    @Column(name="rqn_type", nullable=false, length=2147483647)
    @JsonProperty("rqn_type")
    private String rqnType;

    @Column(name="rqn_required")
    @JsonProperty("rqn_required")
    private Boolean rqnRequired;

    @Column(name="rqn_select_values", length=2147483647)
    @JsonProperty("rqn_select_values")
    private String rqnSelectValues;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="rqn_dcre")
    @CreationTimestamp
    @JsonProperty("rqn_dcre")
    private Date rqnDcre;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="rqn_dmod")
    @UpdateTimestamp
    @JsonProperty("rqn_dmod")
    private Date rqnDmod;

    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="rqn_umod_id", referencedColumnName="id")
    @JsonIgnore
    private Users modifiedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="rqn_ucre_id", referencedColumnName="id")
    @JsonIgnore
    private Users createdBy;

    /**
     * Constructor
     */
    public ReportQuestion() {
        super();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRqnCode() {
        return rqnCode;
    }

    public void setRqnCode(String rqnCode) {
        this.rqnCode = rqnCode;
    }

    public String getRqnSlabel() {
        return rqnSlabel;
    }

    public void setRqnSlabel(String rqnSlabel) {
        this.rqnSlabel = rqnSlabel;
    }

    public String getRqnLlabel() {
        return rqnLlabel;
    }

    public void setRqnLlabel(String rqnLlabel) {
        this.rqnLlabel = rqnLlabel;
    }

    public String getRqnType() {
        return rqnType;
    }

    public void setRqnType(String rqnType) {
        this.rqnType = rqnType;
    }

    public Boolean getRqnRequired() {
        return rqnRequired;
    }

    public void setRqnRequired(Boolean rqnRequired) {
        this.rqnRequired = rqnRequired;
    }

    public String getRqnSelectValues() {
        return rqnSelectValues;
    }

    public void setRqnSelectValues(String rqnSelectValues) {
        this.rqnSelectValues = rqnSelectValues;
    }

    public Date getRqnDcre() {
        return rqnDcre;
    }

    public void setRqnDcre(Date rqnDcre) {
        this.rqnDcre = rqnDcre;
    }

    public Date getRqnDmod() {
        return rqnDmod;
    }

    public void setRqnDmod(Date rqnDmod) {
        this.rqnDmod = rqnDmod;
    }

    //--- GETTERS AND SETTERS FOR LINKS ---\\

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
