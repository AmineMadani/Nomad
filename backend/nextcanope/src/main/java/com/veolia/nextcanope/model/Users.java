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
 * JPA entity class for "Users"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="users", schema="nomad" )
public class Users implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="usr_first_name", nullable=false, length=2147483647)
    private String usrFirstName ;

    @Column(name="usr_last_name", nullable=false, length=2147483647)
    private String usrLastName ;

    @Column(name="usr_email", nullable=false, length=2147483647)
    private String usrEmail ;

    @Column(name="usr_valid")
    private Boolean usrValid ;

    @Column(name="usr_ucre_id")
    private Long usrUcreId ;

    @Column(name="usr_umod_id")
    private Long usrUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="usr_dcre")
    private Date usrDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="usr_dmod")
    private Date usrDmod ;


    //--- ENTITY LINKS ( RELATIONSHIP )

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<AstWtr> listOfModifiedAstWtr ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<AstWtr> listOfCreatedAstWtr ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Users> listOfModifiedUsers ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<AssetType> listOfModifiedAssetType ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Task> listOfModifiedTask ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<AssetType> listOfCreatedAssetType ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Task> listOfCreatedTask ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<ContractActivity> listOfModifiedContractActivity ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Asset> listOfModifiedAsset ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<ContractActivity> listOfCreatedContractActivity ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<City> listOfModifiedCity ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Contract> listOfModifiedContract ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Asset> listOfCreatedAsset ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<City> listOfCreatedCity ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Contract> listOfCreatedContract ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<LayerReferences> listOfLayerModifiedReferences ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<LayerReferences> listOfLayerCreatedReferences ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<AppGrid> listOfModifiedAppGrid ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<AppGrid> listOfCreatedAppGrid ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Basemaps> listOfModifiedBasemaps ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<WorkorderTaskStatus> listOfModifiedWorkorderTaskStatus ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<WorkorderTaskStatus> listOfCreatedWorkorderTaskStatus ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Basemaps> listOfCreatedBasemaps ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedUser")
    private List<Tree> listOfModifiedTree ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<WorkorderTaskReason> listOfModifiedWorkorderTaskReason ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdUser")
    private List<Tree> listOfCreatedTree ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<WorkorderTaskReason> listOfCreatedWorkorderTaskReason ; 


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="usr_ucre_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users createdBy ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<LayerReferencesDefault> listOfModifiedLayerReferencesDefault ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<LayerReferencesDefault> listOfCreatedLayerReferencesDefault ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Users> listOfCreatedUsers ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Street> listOfModifiedStreet ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<VlTopologyType> listOfModifiedVlTopologyType ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Report> listOfModifiedReport ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Domains> listOfModifiedDomains ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="user")
    private List<LayerReferencesUser> listOfLayerReferences ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Street> listOfCreatedStreet ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<VlTopologyType> listOfCreatedVlTopologyType ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Report> listOfCreatedReport ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Domains> listOfCreatedDomains ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<LayerReferencesUser> listOfModifiedLayerReferences ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Workorder> listOfModifiedWorkorder ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Layer> listOfModifiedLayer ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<LayerReferencesUser> listOfCreatedLayerReferences ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Workorder> listOfCreatedWorkorder ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Layer> listOfCreatedLayer ; 


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="usr_umod_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users modifiedBy ; 


    /**
     * Constructor
     */
    public Users() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Long id ) {
        this.id = id ;
    }
    public Long getId() {
        return this.id;
    }

    public void setUsrFirstName( String usrFirstName ) {
        this.usrFirstName = usrFirstName ;
    }
    public String getUsrFirstName() {
        return this.usrFirstName;
    }

    public void setUsrLastName( String usrLastName ) {
        this.usrLastName = usrLastName ;
    }
    public String getUsrLastName() {
        return this.usrLastName;
    }

    public void setUsrEmail( String usrEmail ) {
        this.usrEmail = usrEmail ;
    }
    public String getUsrEmail() {
        return this.usrEmail;
    }

    public void setUsrValid( Boolean usrValid ) {
        this.usrValid = usrValid ;
    }
    public Boolean getUsrValid() {
        return this.usrValid;
    }

    public void setUsrUcreId( Long usrUcreId ) {
        this.usrUcreId = usrUcreId ;
    }
    public Long getUsrUcreId() {
        return this.usrUcreId;
    }

    public void setUsrUmodId( Long usrUmodId ) {
        this.usrUmodId = usrUmodId ;
    }
    public Long getUsrUmodId() {
        return this.usrUmodId;
    }

    public void setUsrDcre( Date usrDcre ) {
        this.usrDcre = usrDcre ;
    }
    public Date getUsrDcre() {
        return this.usrDcre;
    }

    public void setUsrDmod( Date usrDmod ) {
        this.usrDmod = usrDmod ;
    }
    public Date getUsrDmod() {
        return this.usrDmod;
    }

    //--- GETTERS FOR LINKS
    public List<AstWtr> getListOfModifiedAstWtr() {
        return this.listOfModifiedAstWtr;
    } 

    public List<AstWtr> getListOfCreatedAstWtr() {
        return this.listOfCreatedAstWtr;
    } 

    public List<Users> getListOfModifiedUsers() {
        return this.listOfModifiedUsers;
    } 

    public List<AssetType> getListOfModifiedAssetType() {
        return this.listOfModifiedAssetType;
    } 

    public List<Task> getListOfModifiedTask() {
        return this.listOfModifiedTask;
    } 

    public List<AssetType> getListOfCreatedAssetType() {
        return this.listOfCreatedAssetType;
    } 

    public List<Task> getListOfCreatedTask() {
        return this.listOfCreatedTask;
    } 

    public List<ContractActivity> getListOfModifiedContractActivity() {
        return this.listOfModifiedContractActivity;
    } 

    public List<Asset> getListOfModifiedAsset() {
        return this.listOfModifiedAsset;
    } 

    public List<ContractActivity> getListOfCreatedContractActivity() {
        return this.listOfCreatedContractActivity;
    } 

    public List<City> getListOfModifiedCity() {
        return this.listOfModifiedCity;
    } 

    public List<Contract> getListOfModifiedContract() {
        return this.listOfModifiedContract;
    } 

    public List<Asset> getListOfCreatedAsset() {
        return this.listOfCreatedAsset;
    } 

    public List<City> getListOfCreatedCity() {
        return this.listOfCreatedCity;
    } 

    public List<Contract> getListOfCreatedContract() {
        return this.listOfCreatedContract;
    } 

    public List<LayerReferences> getListOfLayerModifiedReferences() {
        return this.listOfLayerModifiedReferences;
    } 

    public List<LayerReferences> getListOfLayerCreatedReferences() {
        return this.listOfLayerCreatedReferences;
    } 

    public List<AppGrid> getListOfModifiedAppGrid() {
        return this.listOfModifiedAppGrid;
    } 

    public List<AppGrid> getListOfCreatedAppGrid() {
        return this.listOfCreatedAppGrid;
    } 

    public List<Basemaps> getListOfModifiedBasemaps() {
        return this.listOfModifiedBasemaps;
    } 

    public List<WorkorderTaskStatus> getListOfModifiedWorkorderTaskStatus() {
        return this.listOfModifiedWorkorderTaskStatus;
    } 

    public List<WorkorderTaskStatus> getListOfCreatedWorkorderTaskStatus() {
        return this.listOfCreatedWorkorderTaskStatus;
    } 

    public List<Basemaps> getListOfCreatedBasemaps() {
        return this.listOfCreatedBasemaps;
    } 

    public List<Tree> getListOfModifiedTree() {
        return this.listOfModifiedTree;
    } 

    public List<WorkorderTaskReason> getListOfModifiedWorkorderTaskReason() {
        return this.listOfModifiedWorkorderTaskReason;
    } 

    public List<Tree> getListOfCreatedTree() {
        return this.listOfCreatedTree;
    } 

    public List<WorkorderTaskReason> getListOfCreatedWorkorderTaskReason() {
        return this.listOfCreatedWorkorderTaskReason;
    } 

    public Users getCreatedBy() {
        return this.createdBy;
    } 

    public List<LayerReferencesDefault> getListOfModifiedLayerReferencesDefault() {
        return this.listOfModifiedLayerReferencesDefault;
    } 

    public List<LayerReferencesDefault> getListOfCreatedLayerReferencesDefault() {
        return this.listOfCreatedLayerReferencesDefault;
    } 

    public List<Users> getListOfCreatedUsers() {
        return this.listOfCreatedUsers;
    } 

    public List<Street> getListOfModifiedStreet() {
        return this.listOfModifiedStreet;
    } 

    public List<VlTopologyType> getListOfModifiedVlTopologyType() {
        return this.listOfModifiedVlTopologyType;
    } 

    public List<Report> getListOfModifiedReport() {
        return this.listOfModifiedReport;
    } 

    public List<Domains> getListOfModifiedDomains() {
        return this.listOfModifiedDomains;
    } 

    public List<LayerReferencesUser> getListOfLayerReferences() {
        return this.listOfLayerReferences;
    } 

    public List<Street> getListOfCreatedStreet() {
        return this.listOfCreatedStreet;
    } 

    public List<VlTopologyType> getListOfCreatedVlTopologyType() {
        return this.listOfCreatedVlTopologyType;
    } 

    public List<Report> getListOfCreatedReport() {
        return this.listOfCreatedReport;
    } 

    public List<Domains> getListOfCreatedDomains() {
        return this.listOfCreatedDomains;
    } 

    public List<LayerReferencesUser> getListOfModifiedLayerReferences() {
        return this.listOfModifiedLayerReferences;
    } 

    public List<Workorder> getListOfModifiedWorkorder() {
        return this.listOfModifiedWorkorder;
    } 

    public List<Layer> getListOfModifiedLayer() {
        return this.listOfModifiedLayer;
    } 

    public List<LayerReferencesUser> getListOfCreatedLayerReferences() {
        return this.listOfCreatedLayerReferences;
    } 

    public List<Workorder> getListOfCreatedWorkorder() {
        return this.listOfCreatedWorkorder;
    } 

    public List<Layer> getListOfCreatedLayer() {
        return this.listOfCreatedLayer;
    } 

    public Users getModifiedBy() {
        return this.modifiedBy;
    } 


}
