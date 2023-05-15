/*
 * Created on 2023-05-15 ( 11:14:14 )
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import jakarta.persistence.*;

/**
 * JPA entity class for "Street"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="street", schema="nomad" )
public class Street implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="str_code", length=2147483647)
    private String strCode ;

    @Column(name="cty_id")
    private Long ctyId ;

    @Column(name="str_slabel", length=2147483647)
    private String strSlabel ;

    @Column(name="str_llabel", length=2147483647)
    private String strLlabel ;

    @Column(name="str_source", length=2147483647)
    private String strSource ;

    @Column(name="str_valid")
    private Boolean strValid ;

    @Column(name="geom", length=2147483647)
    private String geom ;

    @Column(name="str_ucre_id")
    private Long strUcreId ;

    @Column(name="str_umod_id")
    private Long strUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="str_dcre")
    private Date strDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="str_dmod")
    private Date strDmod ;


    //--- ENTITY LINKS ( RELATIONSHIP )
    @ManyToOne
    @JoinColumn(name="cty_id", referencedColumnName="id", insertable=false, updatable=false)
    private City city ; 

    @ManyToOne
    @JoinColumn(name="str_ucre_id", referencedColumnName="id", insertable=false, updatable=false)
    private Users createdBy ; 

    @OneToMany(mappedBy="street")
    private List<Workorder> listOfWorkorder ; 

    @ManyToOne
    @JoinColumn(name="str_umod_id", referencedColumnName="id", insertable=false, updatable=false)
    private Users modifiedBy ; 


    /**
     * Constructor
     */
    public Street() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Long id ) {
        this.id = id ;
    }
    public Long getId() {
        return this.id;
    }

    public void setStrCode( String strCode ) {
        this.strCode = strCode ;
    }
    public String getStrCode() {
        return this.strCode;
    }

    public void setCtyId( Long ctyId ) {
        this.ctyId = ctyId ;
    }
    public Long getCtyId() {
        return this.ctyId;
    }

    public void setStrSlabel( String strSlabel ) {
        this.strSlabel = strSlabel ;
    }
    public String getStrSlabel() {
        return this.strSlabel;
    }

    public void setStrLlabel( String strLlabel ) {
        this.strLlabel = strLlabel ;
    }
    public String getStrLlabel() {
        return this.strLlabel;
    }

    public void setStrSource( String strSource ) {
        this.strSource = strSource ;
    }
    public String getStrSource() {
        return this.strSource;
    }

    public void setStrValid( Boolean strValid ) {
        this.strValid = strValid ;
    }
    public Boolean getStrValid() {
        return this.strValid;
    }

    public void setGeom( String geom ) {
        this.geom = geom ;
    }
    public String getGeom() {
        return this.geom;
    }

    public void setStrUcreId( Long strUcreId ) {
        this.strUcreId = strUcreId ;
    }
    public Long getStrUcreId() {
        return this.strUcreId;
    }

    public void setStrUmodId( Long strUmodId ) {
        this.strUmodId = strUmodId ;
    }
    public Long getStrUmodId() {
        return this.strUmodId;
    }

    public void setStrDcre( Date strDcre ) {
        this.strDcre = strDcre ;
    }
    public Date getStrDcre() {
        return this.strDcre;
    }

    public void setStrDmod( Date strDmod ) {
        this.strDmod = strDmod ;
    }
    public Date getStrDmod() {
        return this.strDmod;
    }

    //--- GETTERS FOR LINKS
    public City getCity() {
        return this.city;
    } 

    public Users getCreatedBy() {
        return this.createdBy;
    } 

    public List<Workorder> getListOfWorkorder() {
        return this.listOfWorkorder;
    } 

    public Users getModifiedBy() {
        return this.modifiedBy;
    } 


}
