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
import org.locationtech.jts.geom.Geometry;


/**
 * JPA entity class for "City"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="city", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class City implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY ---\\
        @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
private Long id;

    //--- ENTITY DATA FIELDS ---\\
    @Column(name="cty_code", length=2147483647)
    @JsonProperty("cty_code")
    private String ctyCode;

    @Column(name="cty_slabel", length=2147483647)
    @JsonProperty("cty_slabel")
    private String ctySlabel;

    @Column(name="cty_llabel", length=2147483647)
    @JsonProperty("cty_llabel")
    private String ctyLlabel;

    @Column(name="cty_valid")
    @JsonProperty("cty_valid")
    private Boolean ctyValid;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="cty_dcre")
    @CreationTimestamp
    @JsonProperty("cty_dcre")
    private Date ctyDcre;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="cty_dmod")
    @UpdateTimestamp
    @JsonProperty("cty_dmod")
    private Date ctyDmod;

    @Column(name="geom", length=2147483647)
	@JsonProperty("geom")
    private Geometry geom;

    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="cty_umod_id", referencedColumnName="id")
	@JsonIgnore
    private Users modifiedBy;

    @OneToMany(mappedBy="city")
    @Fetch(value = FetchMode.SUBSELECT)
    private List<Workorder> listOfWorkorder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="cty_ucre_id", referencedColumnName="id")
	@JsonIgnore
    private Users createdBy;

    @OneToMany(mappedBy="city")
    @Fetch(value = FetchMode.SUBSELECT)
    private List<Street> listOfStreet;

    /**
     * Constructor
     */
    public City() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS ---\\
    public Long getId() {
        return this.id;
    }

    public void setId( Long id ) {
        this.id = id ;
    }

    public String getCtyCode() {
        return this.ctyCode;
    }

	public void setCtyCode( String ctyCode ) {
        this.ctyCode = ctyCode ;
    }

    public String getCtySlabel() {
        return this.ctySlabel;
    }

	public void setCtySlabel( String ctySlabel ) {
        this.ctySlabel = ctySlabel ;
    }

    public String getCtyLlabel() {
        return this.ctyLlabel;
    }

	public void setCtyLlabel( String ctyLlabel ) {
        this.ctyLlabel = ctyLlabel ;
    }

    public Boolean getCtyValid() {
        return this.ctyValid;
    }

	public void setCtyValid( Boolean ctyValid ) {
        this.ctyValid = ctyValid ;
    }

    public Date getCtyDcre() {
        return this.ctyDcre;
    }

	public void setCtyDcre( Date ctyDcre ) {
        this.ctyDcre = ctyDcre ;
    }

    public Date getCtyDmod() {
        return this.ctyDmod;
    }

	public void setCtyDmod( Date ctyDmod ) {
        this.ctyDmod = ctyDmod ;
    }

    public Geometry getGeom() {
        return this.geom;
    }

	public void setGeom( Geometry geom ) {
        this.geom = geom ;
    }

    //--- GETTERS AND SETTERS FOR LINKS ---\\
    public Users getModifiedBy() {
        return this.modifiedBy;
    }

    public void setModifiedBy(Users modifiedBy) {
        this.modifiedBy = modifiedBy;
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

    public List<Street> getListOfStreet() {
        return this.listOfStreet;
    }

    public void setListOfStreet(List<Street> listOfStreet) {
        this.listOfStreet = listOfStreet;
    }

}
