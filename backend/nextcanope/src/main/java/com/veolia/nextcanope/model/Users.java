/*
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * JPA entity class for "Users"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="users", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class Users implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="usr_first_name", nullable=false, length=2147483647)
	@JsonProperty("usr_first_name")
    private String usrFirstName ;

    @Column(name="usr_last_name", nullable=false, length=2147483647)
	@JsonProperty("usr_last_name")
    private String usrLastName ;

    @Column(name="usr_email", nullable=false, length=2147483647)
	@JsonProperty("usr_email")
    private String usrEmail ;

    @Column(name="usr_valid")
	@JsonProperty("usr_valid")
    private Boolean usrValid ;

    @Column(name="usr_ucre_id")
	@JsonProperty("usr_ucre_id")
    private Long usrUcreId ;

    @Column(name="usr_umod_id")
	@JsonProperty("usr_umod_id")
    private Long usrUmodId ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="usr_dcre")
	@JsonProperty("usr_dcre")
    private Date usrDcre ;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="usr_dmod")
	@JsonProperty("usr_dmod")
    private Date usrDmod ;

    @Column(name="usr_configuration", length=2147483647)
	@JsonProperty("usr_configuration")
    private String usrConfiguration ;


    //--- ENTITY LINKS ( RELATIONSHIP )

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<AstWtr> listOfModifiedAstWtr ; 


    @OneToMany(mappedBy="modifiedBy")
    private List<StyleImage> listOfModifiedStyleImage ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<AstWtr> listOfCreatedAstWtr ; 


    @OneToMany(mappedBy="modifiedBy")
    private List<FormTemplate> listOfModifiedFormTemplate ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Users> listOfModifiedUsers ; 


    @OneToMany(mappedBy="createdBy")
    private List<StyleImage> listOfCreatedStyleImage ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<AssetType> listOfModifiedAssetType ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Task> listOfModifiedTask ; 


    @OneToMany(mappedBy="createdBy")
    private List<FormTemplate> listOfCreatedFormTemplate ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<AssetType> listOfCreatedAssetType ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Task> listOfCreatedTask ; 


    @OneToMany(mappedBy="user")
    private List<FormTemplateCustom> listOfFormTemplateCustom ; 


    @OneToMany(mappedBy="modifiedBy")
    private List<LayerStyle> listOfModifiedLayerStyle ; 


    @OneToMany(mappedBy="createdBy")
    private List<LayerStyle> listOfCreatedLayerStyle ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<ContractActivity> listOfModifiedContractActivity ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Asset> listOfModifiedAsset ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<ContractActivity> listOfCreatedContractActivity ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<City> listOfModifiedCity ; 


    @OneToMany(mappedBy="modifiedBy")
    private List<FormDefinition> listOfModifiedForm ; 


    @OneToMany(mappedBy="modifiedBy")
    private List<StyleDefinition> listOfModifiedStyleDefinition ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Contract> listOfModifiedContract ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Asset> listOfCreatedAsset ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<City> listOfCreatedCity ; 


    @OneToMany(mappedBy="createdBy")
    private List<StyleDefinition> listOfCreatedStyleDefinition ; 


    @OneToMany(mappedBy="createdBy")
    private List<FormDefinition> listOfCreatedFormDefinition ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Contract> listOfCreatedContract ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<LayerReferences> listOfLayerModifiedReferences ; 


    @OneToMany(mappedBy="modifiedBy")
    private List<LayerStyleCustom> listOfModifiedLayerStyleCustom ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<LayerReferences> listOfLayerCreatedReferences ; 


    @OneToMany(mappedBy="createdBy")
    private List<LayerStyleCustom> listOfCreatedLayerStyleCustom ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<AppGrid> listOfModifiedAppGrid ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<AppGrid> listOfCreatedAppGrid ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Basemaps> listOfModifiedBasemaps ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<WorkorderTaskStatus> listOfModifiedWorkorderTaskStatus ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Basemaps> listOfCreatedBasemaps ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<WorkorderTaskStatus> listOfCreatedWorkorderTaskStatus ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedUser")
    private List<Tree> listOfModifiedTree ; 


    @OneToMany(mappedBy="users")
    private List<LayerStyleCustom> listOfLayerStyleCustom ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdUser")
    private List<Tree> listOfCreatedTree ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<WorkorderTaskReason> listOfModifiedWorkorderTaskReason ; 


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


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<VlTopologyType> listOfModifiedVlTopologyType ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Street> listOfModifiedStreet ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Users> listOfCreatedUsers ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Report> listOfModifiedReport ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Domains> listOfModifiedDomains ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="user")
    private List<LayerReferencesUser> listOfLayerReferences ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<VlTopologyType> listOfCreatedVlTopologyType ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Street> listOfCreatedStreet ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Report> listOfCreatedReport ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Domains> listOfCreatedDomains ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Workorder> listOfModifiedWorkorder ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<LayerReferencesUser> listOfModifiedLayerReferences ; 


    @OneToMany(mappedBy="modifiedBy")
    private List<FormTemplateCustom> listOfModifiedFormTemplateCustom ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Layer> listOfModifiedLayer ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Workorder> listOfCreatedWorkorder ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<LayerReferencesUser> listOfCreatedLayerReferences ; 


    @OneToMany(mappedBy="createdBy")
    private List<FormTemplateCustom> listOfCreatedFormTemplateCustom ; 


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="usr_umod_id", referencedColumnName="id", insertable=false, updatable=false)
	@JsonIgnore
    private Users modifiedBy ; 


    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Layer> listOfCreatedLayer ; 


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

	public void setUsrConfiguration( String usrConfiguration ) {
        this.usrConfiguration = usrConfiguration ;
    }

    public String getUsrConfiguration() {
        return this.usrConfiguration;
    }

    //--- GETTERS FOR LINKS
    public List<AstWtr> getListOfModifiedAstWtr() {
        return this.listOfModifiedAstWtr;
    } 

    public List<StyleImage> getListOfModifiedStyleImage() {
        return this.listOfModifiedStyleImage;
    } 

    public List<AstWtr> getListOfCreatedAstWtr() {
        return this.listOfCreatedAstWtr;
    } 

    public List<FormTemplate> getListOfModifiedFormTemplate() {
        return this.listOfModifiedFormTemplate;
    } 

    public List<Users> getListOfModifiedUsers() {
        return this.listOfModifiedUsers;
    } 

    public List<StyleImage> getListOfCreatedStyleImage() {
        return this.listOfCreatedStyleImage;
    } 

    public List<AssetType> getListOfModifiedAssetType() {
        return this.listOfModifiedAssetType;
    } 

    public List<Task> getListOfModifiedTask() {
        return this.listOfModifiedTask;
    } 

    public List<FormTemplate> getListOfCreatedFormTemplate() {
        return this.listOfCreatedFormTemplate;
    } 

    public List<AssetType> getListOfCreatedAssetType() {
        return this.listOfCreatedAssetType;
    } 

    public List<Task> getListOfCreatedTask() {
        return this.listOfCreatedTask;
    } 

    public List<FormTemplateCustom> getListOfFormTemplateCustom() {
        return this.listOfFormTemplateCustom;
    } 

    public List<LayerStyle> getListOfModifiedLayerStyle() {
        return this.listOfModifiedLayerStyle;
    } 

    public List<LayerStyle> getListOfCreatedLayerStyle() {
        return this.listOfCreatedLayerStyle;
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

    public List<FormDefinition> getListOfModifiedForm() {
        return this.listOfModifiedForm;
    } 

    public List<StyleDefinition> getListOfModifiedStyleDefinition() {
        return this.listOfModifiedStyleDefinition;
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

    public List<StyleDefinition> getListOfCreatedStyleDefinition() {
        return this.listOfCreatedStyleDefinition;
    } 

    public List<FormDefinition> getListOfCreatedFormDefinition() {
        return this.listOfCreatedFormDefinition;
    } 

    public List<Contract> getListOfCreatedContract() {
        return this.listOfCreatedContract;
    } 

    public List<LayerReferences> getListOfLayerModifiedReferences() {
        return this.listOfLayerModifiedReferences;
    } 

    public List<LayerStyleCustom> getListOfModifiedLayerStyleCustom() {
        return this.listOfModifiedLayerStyleCustom;
    } 

    public List<LayerReferences> getListOfLayerCreatedReferences() {
        return this.listOfLayerCreatedReferences;
    } 

    public List<LayerStyleCustom> getListOfCreatedLayerStyleCustom() {
        return this.listOfCreatedLayerStyleCustom;
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

    public List<Basemaps> getListOfCreatedBasemaps() {
        return this.listOfCreatedBasemaps;
    } 

    public List<WorkorderTaskStatus> getListOfCreatedWorkorderTaskStatus() {
        return this.listOfCreatedWorkorderTaskStatus;
    } 

    public List<Tree> getListOfModifiedTree() {
        return this.listOfModifiedTree;
    } 

    public List<LayerStyleCustom> getListOfLayerStyleCustom() {
        return this.listOfLayerStyleCustom;
    } 

    public List<Tree> getListOfCreatedTree() {
        return this.listOfCreatedTree;
    } 

    public List<WorkorderTaskReason> getListOfModifiedWorkorderTaskReason() {
        return this.listOfModifiedWorkorderTaskReason;
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

    public List<VlTopologyType> getListOfModifiedVlTopologyType() {
        return this.listOfModifiedVlTopologyType;
    } 

    public List<Street> getListOfModifiedStreet() {
        return this.listOfModifiedStreet;
    } 

    public List<Users> getListOfCreatedUsers() {
        return this.listOfCreatedUsers;
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

    public List<VlTopologyType> getListOfCreatedVlTopologyType() {
        return this.listOfCreatedVlTopologyType;
    } 

    public List<Street> getListOfCreatedStreet() {
        return this.listOfCreatedStreet;
    } 

    public List<Report> getListOfCreatedReport() {
        return this.listOfCreatedReport;
    } 

    public List<Domains> getListOfCreatedDomains() {
        return this.listOfCreatedDomains;
    } 

    public List<Workorder> getListOfModifiedWorkorder() {
        return this.listOfModifiedWorkorder;
    } 

    public List<LayerReferencesUser> getListOfModifiedLayerReferences() {
        return this.listOfModifiedLayerReferences;
    } 

    public List<FormTemplateCustom> getListOfModifiedFormTemplateCustom() {
        return this.listOfModifiedFormTemplateCustom;
    } 

    public List<Layer> getListOfModifiedLayer() {
        return this.listOfModifiedLayer;
    } 

    public List<Workorder> getListOfCreatedWorkorder() {
        return this.listOfCreatedWorkorder;
    } 

    public List<LayerReferencesUser> getListOfCreatedLayerReferences() {
        return this.listOfCreatedLayerReferences;
    } 

    public List<FormTemplateCustom> getListOfCreatedFormTemplateCustom() {
        return this.listOfCreatedFormTemplateCustom;
    } 

    public Users getModifiedBy() {
        return this.modifiedBy;
    } 

    public List<Layer> getListOfCreatedLayer() {
        return this.listOfCreatedLayer;
    } 


}
