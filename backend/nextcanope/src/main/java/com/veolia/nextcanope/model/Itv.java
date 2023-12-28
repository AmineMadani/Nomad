package com.veolia.nextcanope.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

@Entity
@Table(name="ITV", schema="nomad" )
public class Itv implements Serializable {
    private static final long serialVersionUID = 1L;

    public static final String STATUS_IMPORT = "I";
    public static final String STATUS_ONGOING = "O";
    public static final String STATUS_ERROR = "E";

    //--- ENTITY PRIMARY KEY ---\\
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id;

    private String itvFilename;
    private String itvStatus;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="itv_dmod")
    @UpdateTimestamp
    @JsonProperty("itv_dmod")
    private Date itvDmod;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="itv_dcre")
    @CreationTimestamp
    @JsonProperty("itv_dcre")
    private Date itvDcre;

    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="itv_ucre_id", referencedColumnName="id")
    @JsonIgnore
    private Users createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="itv_umod_id", referencedColumnName="id")
    @JsonIgnore
    private Users modifiedBy;

    @OneToMany(cascade = { CascadeType.ALL }, mappedBy="itv")
    private List<ItvBlock> listOfItvBlock;

    @OneToMany(cascade = { CascadeType.ALL }, mappedBy="itv")
    private List<ItvPicture> listOfItvPicture;

    /**
     * Constructor
     */
    public Itv() {
        super();
    }

    //--- GETTERS & SETTERS FOR FIELDS ---\\

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItvFilename() {
        return itvFilename;
    }

    public void setItvFilename(String itvFilename) {
        this.itvFilename = itvFilename;
    }

    public String getItvStatus() {
        return itvStatus;
    }

    public void setItvStatus(String itvStatus) {
        this.itvStatus = itvStatus;
    }

    public Date getItvDmod() {
        return itvDmod;
    }

    public void setItvDmod(Date itvDmod) {
        this.itvDmod = itvDmod;
    }

    public Date getItvDcre() {
        return itvDcre;
    }

    public void setItvDcre(Date itvDcre) {
        this.itvDcre = itvDcre;
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

    public List<ItvBlock> getListOfItvBlock() {
        return listOfItvBlock;
    }

    public void setListOfItvBlock(List<ItvBlock> listOfItvBlock) {
        this.listOfItvBlock = listOfItvBlock;
    }

    public List<ItvPicture> getListOfItvPicture() {
        return listOfItvPicture;
    }

    public void setListOfItvPicture(List<ItvPicture> listOfItvPicture) {
        this.listOfItvPicture = listOfItvPicture;
    }
}
