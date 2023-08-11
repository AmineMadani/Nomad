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
import java.util.stream.Collectors;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.locationtech.jts.geom.Geometry;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


/**
 * JPA entity class for "Street"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="street", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class Street implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY ---\\
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id;

    //--- ENTITY DATA FIELDS ---\\
    @Column(name="str_code", length=2147483647)
    @JsonProperty("str_code")
    private String strCode;

    @Column(name="str_slabel", length=2147483647)
    @JsonProperty("str_slabel")
    private String strSlabel;

    @Column(name="str_llabel", length=2147483647)
    @JsonProperty("str_llabel")
    private String strLlabel;

    @Column(name="str_source", length=2147483647)
    @JsonProperty("str_source")
    private String strSource;

    @Column(name="str_valid")
    @JsonProperty("str_valid")
    private Boolean strValid;

    @Column(name="geom", length=2147483647)
	@JsonProperty("geom")
    private Geometry geom;
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="str_dcre")
    @CreationTimestamp
    @JsonProperty("str_dcre")
    private Date strDcre;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="str_dmod")
    @UpdateTimestamp
    @JsonProperty("str_dmod")
    private Date strDmod;


    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @ManyToOne
    @JoinColumn(name="cty_id", referencedColumnName="id")
    private City city;

    @OneToMany(mappedBy="street")
    private List<Workorder> listOfWorkorder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="str_ucre_id", referencedColumnName="id")
	@JsonIgnore
    private Users createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="str_umod_id", referencedColumnName="id")
	@JsonIgnore
    private Users modifiedBy;

    /**
     * Constructor
     */
    public Street() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS ---\\
    public Long getId() {
        return this.id;
    }

    public void setId( Long id ) {
        this.id = id ;
    }

    public String getStrCode() {
        return this.strCode;
    }

	public void setStrCode( String strCode ) {
        this.strCode = strCode ;
    }

    public String getStrSlabel() {
        return this.strSlabel;
    }

	public void setStrSlabel( String strSlabel ) {
        this.strSlabel = strSlabel ;
    }

    public String getStrLlabel() {
        return this.strLlabel;
    }

	public void setStrLlabel( String strLlabel ) {
        this.strLlabel = strLlabel ;
    }

    public String getStrSource() {
        return this.strSource;
    }

	public void setStrSource( String strSource ) {
        this.strSource = strSource ;
    }

    public Boolean getStrValid() {
        return this.strValid;
    }

	public void setStrValid( Boolean strValid ) {
        this.strValid = strValid ;
    }

    public Geometry getGeom() {
        return this.geom;
    }

	public void setGeom( Geometry geom ) {
        this.geom = geom ;
    }

    public Date getStrDcre() {
        return this.strDcre;
    }

	public void setStrDcre( Date strDcre ) {
        this.strDcre = strDcre ;
    }

    public Date getStrDmod() {
        return this.strDmod;
    }

	public void setStrDmod( Date strDmod ) {
        this.strDmod = strDmod ;
    }

    //--- GETTERS AND SETTERS FOR LINKS ---\\
    public City getCity() {
        return this.city;
    }

    public void setCity(City city) {
        this.city = city;
    }

    public List<Workorder> getListOfWorkorder() {
        if (this.listOfWorkorder != null) {
            return this.listOfWorkorder.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<Workorder> getListOfWorkorderWithDeleted() {
        return this.listOfWorkorder;
    }

    public void setListOfWorkorder(List<Workorder> listOfWorkorder) {
        this.listOfWorkorder = listOfWorkorder;
    }

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

}
