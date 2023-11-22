package com.veolia.nextcanope.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name="ITV_PICTURE", schema="nomad" )
public class ItvPicture implements Serializable {
    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY ---\\
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id;

    //--- ENTITY DATA FIELDS ---\\
    private String itpLabel;
    private String itpReference;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="itp_dmod")
    @UpdateTimestamp
    @JsonProperty("itp_dmod")
    private Date itpDmod;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="itp_dcre")
    @CreationTimestamp
    @JsonProperty("itp_dcre")
    private Date itpDcre;

    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @ManyToOne
    @JoinColumn(name="itv_id", referencedColumnName="id")
    private Itv itv;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="itp_ucre_id", referencedColumnName="id")
    @JsonIgnore
    private Users createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="itp_umod_id", referencedColumnName="id")
    @JsonIgnore
    private Users modifiedBy;

    /**
     * Constructor
     */
    public ItvPicture() {
        super();
    }

    //--- GETTERS & SETTERS FOR FIELDS ---\\


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItpLabel() {
        return itpLabel;
    }

    public void setItpLabel(String itpLabel) {
        this.itpLabel = itpLabel;
    }

    public String getItpReference() {
        return itpReference;
    }

    public void setItpReference(String itpReference) {
        this.itpReference = itpReference;
    }

    public Date getItpDmod() {
        return itpDmod;
    }

    public void setItpDmod(Date itpDmod) {
        this.itpDmod = itpDmod;
    }

    public Date getItpDcre() {
        return itpDcre;
    }

    public void setItpDcre(Date itpDcre) {
        this.itpDcre = itpDcre;
    }

    public Itv getItv() {
        return itv;
    }

    public void setItv(Itv itv) {
        this.itv = itv;
    }

    public Users getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Users createdBy) {
        this.createdBy = createdBy;
    }

    public Users getModifiedBy() {
        return modifiedBy;
    }

    public void setModifiedBy(Users modifiedBy) {
        this.modifiedBy = modifiedBy;
    }
}
