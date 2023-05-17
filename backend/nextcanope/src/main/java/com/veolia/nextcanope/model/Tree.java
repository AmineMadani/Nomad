/*
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import jakarta.persistence.*;



import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * JPA entity class for "Tree"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="tree", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class Tree implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="dom_id")
	@JsonProperty("dom_id")
    private Long domId ;

    @Column(name="tre_parent_id")
	@JsonProperty("tre_parent_id")
    private Long treParentId ;

    @Column(name="tre_num_order")
	@JsonProperty("tre_num_order")
    private Integer treNumOrder ;

    @Column(name="tre_llabel", length=2147483647)
	@JsonProperty("tre_llabel")
    private String treLlabel ;

    @Column(name="tre_slabel", length=2147483647)
	@JsonProperty("tre_slabel")
    private String treSlabel ;

    @Column(name="tre_ucre_id")
	@JsonProperty("tre_ucre_id")
    private Long treUcreId ;

    @Column(name="tre_valid")
	@JsonProperty("tre_valid")
    private Boolean treValid ;

    @Column(name="tre_umod_id")
	@JsonProperty("tre_umod_id")
    private Long treUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="tre_dcre")
	@JsonProperty("tre_dcre")
    private Date treDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="tre_dmod")
	@JsonProperty("tre_dmod")
    private Date treDmod ;


    //--- ENTITY LINKS ( RELATIONSHIP )

    @ManyToOne
    @JoinColumn(name="dom_id", referencedColumnName="id", insertable=false, updatable=false)
    private Domains domains ; 


    @OneToMany(mappedBy="tree")
    private List<Tree> listOfTree ; 


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="tre_umod_id", referencedColumnName="id", insertable=false, updatable=false)
    private Users modifiedUser ; 


    @OneToMany(mappedBy="simplifiedTree")
    private List<Layer> listOfSimplifiedLayer ; 


    @OneToMany(mappedBy="tree")
    private List<Layer> listOfLayer ; 


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="tre_ucre_id", referencedColumnName="id", insertable=false, updatable=false)
    private Users createdUser ; 


    @ManyToOne
    @JoinColumn(name="tre_parent_id", referencedColumnName="id", insertable=false, updatable=false)
    private Tree tree ; 


    /**
     * Constructor
     */
    public Tree() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Long id ) {
        this.id = id ;
    }
    public Long getId() {
        return this.id;
    }

	public void setDomId( Long domId ) {
        this.domId = domId ;
    }

    public Long getDomId() {
        return this.domId;
    }

	public void setTreParentId( Long treParentId ) {
        this.treParentId = treParentId ;
    }

    public Long getTreParentId() {
        return this.treParentId;
    }

	public void setTreNumOrder( Integer treNumOrder ) {
        this.treNumOrder = treNumOrder ;
    }

    public Integer getTreNumOrder() {
        return this.treNumOrder;
    }

	public void setTreLlabel( String treLlabel ) {
        this.treLlabel = treLlabel ;
    }

    public String getTreLlabel() {
        return this.treLlabel;
    }

	public void setTreSlabel( String treSlabel ) {
        this.treSlabel = treSlabel ;
    }

    public String getTreSlabel() {
        return this.treSlabel;
    }

	public void setTreUcreId( Long treUcreId ) {
        this.treUcreId = treUcreId ;
    }

    public Long getTreUcreId() {
        return this.treUcreId;
    }

	public void setTreValid( Boolean treValid ) {
        this.treValid = treValid ;
    }

    public Boolean getTreValid() {
        return this.treValid;
    }

	public void setTreUmodId( Long treUmodId ) {
        this.treUmodId = treUmodId ;
    }

    public Long getTreUmodId() {
        return this.treUmodId;
    }

	public void setTreDcre( Date treDcre ) {
        this.treDcre = treDcre ;
    }

    public Date getTreDcre() {
        return this.treDcre;
    }

	public void setTreDmod( Date treDmod ) {
        this.treDmod = treDmod ;
    }

    public Date getTreDmod() {
        return this.treDmod;
    }

    //--- GETTERS FOR LINKS
    public Domains getDomains() {
        return this.domains;
    } 

    public List<Tree> getListOfTree() {
        return this.listOfTree;
    } 

    public Users getModifiedUser() {
        return this.modifiedUser;
    } 

    public List<Layer> getListOfSimplifiedLayer() {
        return this.listOfSimplifiedLayer;
    } 

    public List<Layer> getListOfLayer() {
        return this.listOfLayer;
    } 

    public Users getCreatedUser() {
        return this.createdUser;
    } 

    public Tree getTree() {
        return this.tree;
    } 


}
