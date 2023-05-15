/*
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * JPA entity class for "Contract"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="contract", schema="nomad" )
public class Contract implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="ctr_code", length=2147483647)
    private String ctrCode ;

    @Column(name="ctr_slabel", length=2147483647)
    private String ctrSlabel ;

    @Column(name="ctr_llabel", length=2147483647)
    private String ctrLlabel ;

    @Column(name="ctr_valid")
    private Boolean ctrValid ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="ctr_start_date")
    private Date ctrStartDate ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="ctr_end_date")
    private Date ctrEndDate ;

    @Column(name="ctr_ucre_id")
    private Long ctrUcreId ;

    @Column(name="ctr_umod_id")
    private Long ctrUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="ctr_dcre")
    private Date ctrDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="ctr_dmod")
    private Date ctrDmod ;

    @Column(name="cta_id")
    private Long ctaId ;

    @Column(name="geom", length=2147483647)
    private String geom ;


    //--- ENTITY LINKS ( RELATIONSHIP )

    @ManyToOne
    @JoinColumn(name="cta_id", referencedColumnName="id", insertable=false, updatable=false)
    private ContractActivity contractActivity ; 


    @ManyToOne
    @JoinColumn(name="ctr_ucre_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users createdBy ; 


    @OneToMany(mappedBy="contract")
    private List<Workorder> listOfWorkorder ; 


    @OneToMany(mappedBy="contract")
    private List<Task> listOfTask ; 


    @ManyToOne
    @JoinColumn(name="ctr_umod_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users modifiedBy ; 


    /**
     * Constructor
     */
    public Contract() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Long id ) {
        this.id = id ;
    }
    public Long getId() {
        return this.id;
    }

    public void setCtrCode( String ctrCode ) {
        this.ctrCode = ctrCode ;
    }
    public String getCtrCode() {
        return this.ctrCode;
    }

    public void setCtrSlabel( String ctrSlabel ) {
        this.ctrSlabel = ctrSlabel ;
    }
    public String getCtrSlabel() {
        return this.ctrSlabel;
    }

    public void setCtrLlabel( String ctrLlabel ) {
        this.ctrLlabel = ctrLlabel ;
    }
    public String getCtrLlabel() {
        return this.ctrLlabel;
    }

    public void setCtrValid( Boolean ctrValid ) {
        this.ctrValid = ctrValid ;
    }
    public Boolean getCtrValid() {
        return this.ctrValid;
    }

    public void setCtrStartDate( Date ctrStartDate ) {
        this.ctrStartDate = ctrStartDate ;
    }
    public Date getCtrStartDate() {
        return this.ctrStartDate;
    }

    public void setCtrEndDate( Date ctrEndDate ) {
        this.ctrEndDate = ctrEndDate ;
    }
    public Date getCtrEndDate() {
        return this.ctrEndDate;
    }

    public void setCtrUcreId( Long ctrUcreId ) {
        this.ctrUcreId = ctrUcreId ;
    }
    public Long getCtrUcreId() {
        return this.ctrUcreId;
    }

    public void setCtrUmodId( Long ctrUmodId ) {
        this.ctrUmodId = ctrUmodId ;
    }
    public Long getCtrUmodId() {
        return this.ctrUmodId;
    }

    public void setCtrDcre( Date ctrDcre ) {
        this.ctrDcre = ctrDcre ;
    }
    public Date getCtrDcre() {
        return this.ctrDcre;
    }

    public void setCtrDmod( Date ctrDmod ) {
        this.ctrDmod = ctrDmod ;
    }
    public Date getCtrDmod() {
        return this.ctrDmod;
    }

    public void setCtaId( Long ctaId ) {
        this.ctaId = ctaId ;
    }
    public Long getCtaId() {
        return this.ctaId;
    }

    public void setGeom( String geom ) {
        this.geom = geom ;
    }
    public String getGeom() {
        return this.geom;
    }

    //--- GETTERS FOR LINKS
    public ContractActivity getContractActivity() {
        return this.contractActivity;
    } 

    public Users getCreatedBy() {
        return this.createdBy;
    } 

    public List<Workorder> getListOfWorkorder() {
        return this.listOfWorkorder;
    } 

    public List<Task> getListOfTask() {
        return this.listOfTask;
    } 

    public Users getModifiedBy() {
        return this.modifiedBy;
    } 


}
