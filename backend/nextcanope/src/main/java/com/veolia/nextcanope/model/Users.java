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
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.CreationTimestamp;


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

    //--- ENTITY PRIMARY KEY ---\\
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id;

    //--- ENTITY DATA FIELDS ---\\
    @Column(name="usr_first_name", nullable=false, length=2147483647)
    @JsonProperty("usr_first_name")
    private String usrFirstName;

    @Column(name="usr_last_name", nullable=false, length=2147483647)
    @JsonProperty("usr_last_name")
    private String usrLastName;

    @Column(name="usr_email", nullable=false, length=2147483647)
    @JsonProperty("usr_email")
    private String usrEmail;

    @Column(name="usr_valid")
    @JsonProperty("usr_valid")
    private Boolean usrValid;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="usr_dcre")
    @CreationTimestamp
    @JsonProperty("usr_dcre")
    private Date usrDcre;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="usr_dmod")
    @UpdateTimestamp
    @JsonProperty("usr_dmod")
    private Date usrDmod;

    @Column(name="usr_status", nullable=false, length=2147483647)
    @JsonProperty("usr_status")
    private String usrStatus;

    @Column(name="usr_configuration", length=2147483647)
    @JsonProperty("usr_configuration")
    private String usrConfiguration;

    @Column(name="usr_company", length=2147483647)
    @JsonProperty("usr_company")
    private String usrCompany;


    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<AstWtr> listOfModifiedAstWtr;

    @OneToMany(mappedBy="modifiedBy")
    private List<StyleImage> listOfModifiedStyleImage;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<AstWtr> listOfCreatedAstWtr;

    @OneToMany(mappedBy="modifiedBy")
    private List<FormTemplate> listOfModifiedFormTemplate;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Users> listOfModifiedUsers;

    @OneToMany(mappedBy="createdBy")
    private List<StyleImage> listOfCreatedStyleImage;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<AssetType> listOfModifiedAssetType;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Task> listOfModifiedTask;

    @OneToMany(mappedBy="createdBy")
    private List<FormTemplate> listOfCreatedFormTemplate;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<AssetType> listOfCreatedAssetType;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Task> listOfCreatedTask;

    @OneToMany(mappedBy="user")
    private List<FormTemplateCustom> listOfFormTemplateCustom;

    @OneToMany(mappedBy="modifiedBy")
    private List<LayerStyle> listOfModifiedLayerStyle;

    @OneToMany(mappedBy="createdBy")
    private List<LayerStyle> listOfCreatedLayerStyle;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<ContractActivity> listOfModifiedContractActivity;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Asset> listOfModifiedAsset;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<ContractActivity> listOfCreatedContractActivity;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<City> listOfModifiedCity;

    @OneToMany(mappedBy="modifiedBy")
    private List<FormDefinition> listOfModifiedForm;

    @OneToMany(mappedBy="modifiedBy")
    private List<StyleDefinition> listOfModifiedStyleDefinition;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Contract> listOfModifiedContract;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Asset> listOfCreatedAsset;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<City> listOfCreatedCity;

    @OneToMany(mappedBy="createdBy")
    private List<StyleDefinition> listOfCreatedStyleDefinition;

    @OneToMany(mappedBy="createdBy")
    private List<FormDefinition> listOfCreatedFormDefinition;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Contract> listOfCreatedContract;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<LayerReferences> listOfLayerModifiedReferences;

    @OneToMany(mappedBy="modifiedBy")
    private List<LayerStyleCustom> listOfModifiedLayerStyleCustom;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<LayerReferences> listOfLayerCreatedReferences;

    @OneToMany(mappedBy="createdBy")
    private List<LayerStyleCustom> listOfCreatedLayerStyleCustom;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<AppGrid> listOfModifiedAppGrid;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<AppGrid> listOfCreatedAppGrid;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Basemaps> listOfModifiedBasemaps;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<WorkorderTaskStatus> listOfModifiedWorkorderTaskStatus;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<WorkorderTaskStatus> listOfCreatedWorkorderTaskStatus;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Basemaps> listOfCreatedBasemaps;

    @OneToMany(mappedBy="users")
    private List<LayerStyleCustom> listOfLayerStyleCustom;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<WorkorderTaskReason> listOfModifiedWorkorderTaskReason;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<WorkorderTaskReason> listOfCreatedWorkorderTaskReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="usr_ucre_id", referencedColumnName="id")
	@JsonIgnore
    private Users createdBy;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<LayerReferencesDefault> listOfModifiedLayerReferencesDefault;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<LayerReferencesDefault> listOfCreatedLayerReferencesDefault;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Users> listOfCreatedUsers;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Street> listOfModifiedStreet;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<VlTopologyType> listOfModifiedVlTopologyType;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Report> listOfModifiedReport;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Domains> listOfModifiedDomains;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="user")
    private List<LayerReferencesUser> listOfLayerReferences;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Street> listOfCreatedStreet;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<VlTopologyType> listOfCreatedVlTopologyType;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Report> listOfCreatedReport;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Domains> listOfCreatedDomains;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<LayerReferencesUser> listOfModifiedLayerReferences;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Workorder> listOfModifiedWorkorder;

    @OneToMany(mappedBy="modifiedBy")
    private List<FormTemplateCustom> listOfModifiedFormTemplateCustom;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="modifiedBy")
    private List<Layer> listOfModifiedLayer;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<LayerReferencesUser> listOfCreatedLayerReferences;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Workorder> listOfCreatedWorkorder;

    @OneToMany(mappedBy="createdBy")
    private List<FormTemplateCustom> listOfCreatedFormTemplateCustom;

    @OneToMany(fetch = FetchType.LAZY, mappedBy="createdBy")
    private List<Layer> listOfCreatedLayer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="usr_umod_id", referencedColumnName="id")
	@JsonIgnore
    private Users modifiedBy;

    /**
     * Constructor
     */
    public Users() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS ---\\
    public Long getId() {
        return this.id;
    }

    public void setId( Long id ) {
        this.id = id ;
    }

    public String getUsrFirstName() {
        return this.usrFirstName;
    }

	public void setUsrFirstName( String usrFirstName ) {
        this.usrFirstName = usrFirstName ;
    }

    public String getUsrLastName() {
        return this.usrLastName;
    }

	public void setUsrLastName( String usrLastName ) {
        this.usrLastName = usrLastName ;
    }

    public String getUsrEmail() {
        return this.usrEmail;
    }

	public void setUsrEmail( String usrEmail ) {
        this.usrEmail = usrEmail ;
    }

    public Boolean getUsrValid() {
        return this.usrValid;
    }

	public void setUsrValid( Boolean usrValid ) {
        this.usrValid = usrValid ;
    }

    public Date getUsrDcre() {
        return this.usrDcre;
    }

	public void setUsrDcre( Date usrDcre ) {
        this.usrDcre = usrDcre ;
    }

    public Date getUsrDmod() {
        return this.usrDmod;
    }

	public void setUsrDmod( Date usrDmod ) {
        this.usrDmod = usrDmod ;
    }

    public String getUsrStatus() {
        return this.usrStatus;
    }

	public void setUsrStatus( String usrStatus ) {
        this.usrStatus = usrStatus ;
    }

    public String getUsrConfiguration() {
        return this.usrConfiguration;
    }

	public void setUsrConfiguration( String usrConfiguration ) {
        this.usrConfiguration = usrConfiguration ;
    }

    public String getUsrCompany() {
        return this.usrCompany;
    }

	public void setUsrCompany( String usrCompany ) {
        this.usrCompany = usrCompany ;
    }

    //--- GETTERS AND SETTERS FOR LINKS ---\\
    public List<AstWtr> getListOfModifiedAstWtr() {
        return this.listOfModifiedAstWtr;
    }

    public void setListOfModifiedAstWtr(List<AstWtr> listOfModifiedAstWtr) {
        this.listOfModifiedAstWtr = listOfModifiedAstWtr;
    }

    public List<StyleImage> getListOfModifiedStyleImage() {
        if (this.listOfModifiedStyleImage != null) {
            return this.listOfModifiedStyleImage.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<StyleImage> getListOfModifiedStyleImageWithDeleted() {
        return this.listOfModifiedStyleImage;
    }

    public void setListOfModifiedStyleImage(List<StyleImage> listOfModifiedStyleImage) {
        this.listOfModifiedStyleImage = listOfModifiedStyleImage;
    }

    public List<AstWtr> getListOfCreatedAstWtr() {
        return this.listOfCreatedAstWtr;
    }

    public void setListOfCreatedAstWtr(List<AstWtr> listOfCreatedAstWtr) {
        this.listOfCreatedAstWtr = listOfCreatedAstWtr;
    }

    public List<FormTemplate> getListOfModifiedFormTemplate() {
        if (this.listOfModifiedFormTemplate != null) {
            return this.listOfModifiedFormTemplate.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<FormTemplate> getListOfModifiedFormTemplateWithDeleted() {
        return this.listOfModifiedFormTemplate;
    }

    public void setListOfModifiedFormTemplate(List<FormTemplate> listOfModifiedFormTemplate) {
        this.listOfModifiedFormTemplate = listOfModifiedFormTemplate;
    }

    public List<Users> getListOfModifiedUsers() {
        return this.listOfModifiedUsers;
    }

    public void setListOfModifiedUsers(List<Users> listOfModifiedUsers) {
        this.listOfModifiedUsers = listOfModifiedUsers;
    }

    public List<StyleImage> getListOfCreatedStyleImage() {
        if (this.listOfCreatedStyleImage != null) {
            return this.listOfCreatedStyleImage.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<StyleImage> getListOfCreatedStyleImageWithDeleted() {
        return this.listOfCreatedStyleImage;
    }

    public void setListOfCreatedStyleImage(List<StyleImage> listOfCreatedStyleImage) {
        this.listOfCreatedStyleImage = listOfCreatedStyleImage;
    }

    public List<AssetType> getListOfModifiedAssetType() {
        return this.listOfModifiedAssetType;
    }

    public void setListOfModifiedAssetType(List<AssetType> listOfModifiedAssetType) {
        this.listOfModifiedAssetType = listOfModifiedAssetType;
    }

    public List<Task> getListOfModifiedTask() {
        if (this.listOfModifiedTask != null) {
            return this.listOfModifiedTask.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<Task> getListOfModifiedTaskWithDeleted() {
        return this.listOfModifiedTask;
    }

    public void setListOfModifiedTask(List<Task> listOfModifiedTask) {
        this.listOfModifiedTask = listOfModifiedTask;
    }

    public List<FormTemplate> getListOfCreatedFormTemplate() {
        if (this.listOfCreatedFormTemplate != null) {
            return this.listOfCreatedFormTemplate.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<FormTemplate> getListOfCreatedFormTemplateWithDeleted() {
        return this.listOfCreatedFormTemplate;
    }

    public void setListOfCreatedFormTemplate(List<FormTemplate> listOfCreatedFormTemplate) {
        this.listOfCreatedFormTemplate = listOfCreatedFormTemplate;
    }

    public List<AssetType> getListOfCreatedAssetType() {
        return this.listOfCreatedAssetType;
    }

    public void setListOfCreatedAssetType(List<AssetType> listOfCreatedAssetType) {
        this.listOfCreatedAssetType = listOfCreatedAssetType;
    }

    public List<Task> getListOfCreatedTask() {
        if (this.listOfCreatedTask != null) {
            return this.listOfCreatedTask.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<Task> getListOfCreatedTaskWithDeleted() {
        return this.listOfCreatedTask;
    }

    public void setListOfCreatedTask(List<Task> listOfCreatedTask) {
        this.listOfCreatedTask = listOfCreatedTask;
    }

    public List<FormTemplateCustom> getListOfFormTemplateCustom() {
        if (this.listOfFormTemplateCustom != null) {
            return this.listOfFormTemplateCustom.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<FormTemplateCustom> getListOfFormTemplateCustomWithDeleted() {
        return this.listOfFormTemplateCustom;
    }

    public void setListOfFormTemplateCustom(List<FormTemplateCustom> listOfFormTemplateCustom) {
        this.listOfFormTemplateCustom = listOfFormTemplateCustom;
    }

    public List<LayerStyle> getListOfModifiedLayerStyle() {
        if (this.listOfModifiedLayerStyle != null) {
            return this.listOfModifiedLayerStyle.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<LayerStyle> getListOfModifiedLayerStyleWithDeleted() {
        return this.listOfModifiedLayerStyle;
    }

    public void setListOfModifiedLayerStyle(List<LayerStyle> listOfModifiedLayerStyle) {
        this.listOfModifiedLayerStyle = listOfModifiedLayerStyle;
    }

    public List<LayerStyle> getListOfCreatedLayerStyle() {
        if (this.listOfCreatedLayerStyle != null) {
            return this.listOfCreatedLayerStyle.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<LayerStyle> getListOfCreatedLayerStyleWithDeleted() {
        return this.listOfCreatedLayerStyle;
    }

    public void setListOfCreatedLayerStyle(List<LayerStyle> listOfCreatedLayerStyle) {
        this.listOfCreatedLayerStyle = listOfCreatedLayerStyle;
    }

    public List<ContractActivity> getListOfModifiedContractActivity() {
        return this.listOfModifiedContractActivity;
    }

    public void setListOfModifiedContractActivity(List<ContractActivity> listOfModifiedContractActivity) {
        this.listOfModifiedContractActivity = listOfModifiedContractActivity;
    }

    public List<Asset> getListOfModifiedAsset() {
        return this.listOfModifiedAsset;
    }

    public void setListOfModifiedAsset(List<Asset> listOfModifiedAsset) {
        this.listOfModifiedAsset = listOfModifiedAsset;
    }

    public List<ContractActivity> getListOfCreatedContractActivity() {
        return this.listOfCreatedContractActivity;
    }

    public void setListOfCreatedContractActivity(List<ContractActivity> listOfCreatedContractActivity) {
        this.listOfCreatedContractActivity = listOfCreatedContractActivity;
    }

    public List<City> getListOfModifiedCity() {
        return this.listOfModifiedCity;
    }

    public void setListOfModifiedCity(List<City> listOfModifiedCity) {
        this.listOfModifiedCity = listOfModifiedCity;
    }

    public List<FormDefinition> getListOfModifiedForm() {
        if (this.listOfModifiedForm != null) {
            return this.listOfModifiedForm.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<FormDefinition> getListOfModifiedFormWithDeleted() {
        return this.listOfModifiedForm;
    }

    public void setListOfModifiedForm(List<FormDefinition> listOfModifiedForm) {
        this.listOfModifiedForm = listOfModifiedForm;
    }

    public List<StyleDefinition> getListOfModifiedStyleDefinition() {
        if (this.listOfModifiedStyleDefinition != null) {
            return this.listOfModifiedStyleDefinition.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<StyleDefinition> getListOfModifiedStyleDefinitionWithDeleted() {
        return this.listOfModifiedStyleDefinition;
    }

    public void setListOfModifiedStyleDefinition(List<StyleDefinition> listOfModifiedStyleDefinition) {
        this.listOfModifiedStyleDefinition = listOfModifiedStyleDefinition;
    }

    public List<Contract> getListOfModifiedContract() {
        return this.listOfModifiedContract;
    }

    public void setListOfModifiedContract(List<Contract> listOfModifiedContract) {
        this.listOfModifiedContract = listOfModifiedContract;
    }

    public List<Asset> getListOfCreatedAsset() {
        return this.listOfCreatedAsset;
    }

    public void setListOfCreatedAsset(List<Asset> listOfCreatedAsset) {
        this.listOfCreatedAsset = listOfCreatedAsset;
    }

    public List<City> getListOfCreatedCity() {
        return this.listOfCreatedCity;
    }

    public void setListOfCreatedCity(List<City> listOfCreatedCity) {
        this.listOfCreatedCity = listOfCreatedCity;
    }

    public List<StyleDefinition> getListOfCreatedStyleDefinition() {
        if (this.listOfCreatedStyleDefinition != null) {
            return this.listOfCreatedStyleDefinition.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<StyleDefinition> getListOfCreatedStyleDefinitionWithDeleted() {
        return this.listOfCreatedStyleDefinition;
    }

    public void setListOfCreatedStyleDefinition(List<StyleDefinition> listOfCreatedStyleDefinition) {
        this.listOfCreatedStyleDefinition = listOfCreatedStyleDefinition;
    }

    public List<FormDefinition> getListOfCreatedFormDefinition() {
        if (this.listOfCreatedFormDefinition != null) {
            return this.listOfCreatedFormDefinition.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<FormDefinition> getListOfCreatedFormDefinitionWithDeleted() {
        return this.listOfCreatedFormDefinition;
    }

    public void setListOfCreatedFormDefinition(List<FormDefinition> listOfCreatedFormDefinition) {
        this.listOfCreatedFormDefinition = listOfCreatedFormDefinition;
    }

    public List<Contract> getListOfCreatedContract() {
        return this.listOfCreatedContract;
    }

    public void setListOfCreatedContract(List<Contract> listOfCreatedContract) {
        this.listOfCreatedContract = listOfCreatedContract;
    }

    public List<LayerReferences> getListOfLayerModifiedReferences() {
        return this.listOfLayerModifiedReferences;
    }

    public void setListOfLayerModifiedReferences(List<LayerReferences> listOfLayerModifiedReferences) {
        this.listOfLayerModifiedReferences = listOfLayerModifiedReferences;
    }

    public List<LayerStyleCustom> getListOfModifiedLayerStyleCustom() {
        if (this.listOfModifiedLayerStyleCustom != null) {
            return this.listOfModifiedLayerStyleCustom.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<LayerStyleCustom> getListOfModifiedLayerStyleCustomWithDeleted() {
        return this.listOfModifiedLayerStyleCustom;
    }

    public void setListOfModifiedLayerStyleCustom(List<LayerStyleCustom> listOfModifiedLayerStyleCustom) {
        this.listOfModifiedLayerStyleCustom = listOfModifiedLayerStyleCustom;
    }

    public List<LayerReferences> getListOfLayerCreatedReferences() {
        return this.listOfLayerCreatedReferences;
    }

    public void setListOfLayerCreatedReferences(List<LayerReferences> listOfLayerCreatedReferences) {
        this.listOfLayerCreatedReferences = listOfLayerCreatedReferences;
    }

    public List<LayerStyleCustom> getListOfCreatedLayerStyleCustom() {
        if (this.listOfCreatedLayerStyleCustom != null) {
            return this.listOfCreatedLayerStyleCustom.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<LayerStyleCustom> getListOfCreatedLayerStyleCustomWithDeleted() {
        return this.listOfCreatedLayerStyleCustom;
    }

    public void setListOfCreatedLayerStyleCustom(List<LayerStyleCustom> listOfCreatedLayerStyleCustom) {
        this.listOfCreatedLayerStyleCustom = listOfCreatedLayerStyleCustom;
    }

    public List<AppGrid> getListOfModifiedAppGrid() {
        return this.listOfModifiedAppGrid;
    }

    public void setListOfModifiedAppGrid(List<AppGrid> listOfModifiedAppGrid) {
        this.listOfModifiedAppGrid = listOfModifiedAppGrid;
    }

    public List<AppGrid> getListOfCreatedAppGrid() {
        return this.listOfCreatedAppGrid;
    }

    public void setListOfCreatedAppGrid(List<AppGrid> listOfCreatedAppGrid) {
        this.listOfCreatedAppGrid = listOfCreatedAppGrid;
    }

    public List<Basemaps> getListOfModifiedBasemaps() {
        return this.listOfModifiedBasemaps;
    }

    public void setListOfModifiedBasemaps(List<Basemaps> listOfModifiedBasemaps) {
        this.listOfModifiedBasemaps = listOfModifiedBasemaps;
    }

    public List<WorkorderTaskStatus> getListOfModifiedWorkorderTaskStatus() {
        return this.listOfModifiedWorkorderTaskStatus;
    }

    public void setListOfModifiedWorkorderTaskStatus(List<WorkorderTaskStatus> listOfModifiedWorkorderTaskStatus) {
        this.listOfModifiedWorkorderTaskStatus = listOfModifiedWorkorderTaskStatus;
    }

    public List<WorkorderTaskStatus> getListOfCreatedWorkorderTaskStatus() {
        return this.listOfCreatedWorkorderTaskStatus;
    }

    public void setListOfCreatedWorkorderTaskStatus(List<WorkorderTaskStatus> listOfCreatedWorkorderTaskStatus) {
        this.listOfCreatedWorkorderTaskStatus = listOfCreatedWorkorderTaskStatus;
    }

    public List<Basemaps> getListOfCreatedBasemaps() {
        return this.listOfCreatedBasemaps;
    }

    public void setListOfCreatedBasemaps(List<Basemaps> listOfCreatedBasemaps) {
        this.listOfCreatedBasemaps = listOfCreatedBasemaps;
    }

    public List<LayerStyleCustom> getListOfLayerStyleCustom() {
        if (this.listOfLayerStyleCustom != null) {
            return this.listOfLayerStyleCustom.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<LayerStyleCustom> getListOfLayerStyleCustomWithDeleted() {
        return this.listOfLayerStyleCustom;
    }

    public void setListOfLayerStyleCustom(List<LayerStyleCustom> listOfLayerStyleCustom) {
        this.listOfLayerStyleCustom = listOfLayerStyleCustom;
    }

    public List<WorkorderTaskReason> getListOfModifiedWorkorderTaskReason() {
        return this.listOfModifiedWorkorderTaskReason;
    }

    public void setListOfModifiedWorkorderTaskReason(List<WorkorderTaskReason> listOfModifiedWorkorderTaskReason) {
        this.listOfModifiedWorkorderTaskReason = listOfModifiedWorkorderTaskReason;
    }

    public List<WorkorderTaskReason> getListOfCreatedWorkorderTaskReason() {
        return this.listOfCreatedWorkorderTaskReason;
    }

    public void setListOfCreatedWorkorderTaskReason(List<WorkorderTaskReason> listOfCreatedWorkorderTaskReason) {
        this.listOfCreatedWorkorderTaskReason = listOfCreatedWorkorderTaskReason;
    }

    public Users getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(Users createdBy) {
        this.createdBy = createdBy;
    }

    public List<LayerReferencesDefault> getListOfModifiedLayerReferencesDefault() {
        return this.listOfModifiedLayerReferencesDefault;
    }

    public void setListOfModifiedLayerReferencesDefault(List<LayerReferencesDefault> listOfModifiedLayerReferencesDefault) {
        this.listOfModifiedLayerReferencesDefault = listOfModifiedLayerReferencesDefault;
    }

    public List<LayerReferencesDefault> getListOfCreatedLayerReferencesDefault() {
        return this.listOfCreatedLayerReferencesDefault;
    }

    public void setListOfCreatedLayerReferencesDefault(List<LayerReferencesDefault> listOfCreatedLayerReferencesDefault) {
        this.listOfCreatedLayerReferencesDefault = listOfCreatedLayerReferencesDefault;
    }

    public List<Users> getListOfCreatedUsers() {
        return this.listOfCreatedUsers;
    }

    public void setListOfCreatedUsers(List<Users> listOfCreatedUsers) {
        this.listOfCreatedUsers = listOfCreatedUsers;
    }

    public List<Street> getListOfModifiedStreet() {
        return this.listOfModifiedStreet;
    }

    public void setListOfModifiedStreet(List<Street> listOfModifiedStreet) {
        this.listOfModifiedStreet = listOfModifiedStreet;
    }

    public List<VlTopologyType> getListOfModifiedVlTopologyType() {
        return this.listOfModifiedVlTopologyType;
    }

    public void setListOfModifiedVlTopologyType(List<VlTopologyType> listOfModifiedVlTopologyType) {
        this.listOfModifiedVlTopologyType = listOfModifiedVlTopologyType;
    }

    public List<Report> getListOfModifiedReport() {
        if (this.listOfModifiedReport != null) {
            return this.listOfModifiedReport.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<Report> getListOfModifiedReportWithDeleted() {
        return this.listOfModifiedReport;
    }

    public void setListOfModifiedReport(List<Report> listOfModifiedReport) {
        this.listOfModifiedReport = listOfModifiedReport;
    }

    public List<Domains> getListOfModifiedDomains() {
        return this.listOfModifiedDomains;
    }

    public void setListOfModifiedDomains(List<Domains> listOfModifiedDomains) {
        this.listOfModifiedDomains = listOfModifiedDomains;
    }

    public List<LayerReferencesUser> getListOfLayerReferences() {
        return this.listOfLayerReferences;
    }

    public void setListOfLayerReferences(List<LayerReferencesUser> listOfLayerReferences) {
        this.listOfLayerReferences = listOfLayerReferences;
    }

    public List<Street> getListOfCreatedStreet() {
        return this.listOfCreatedStreet;
    }

    public void setListOfCreatedStreet(List<Street> listOfCreatedStreet) {
        this.listOfCreatedStreet = listOfCreatedStreet;
    }

    public List<VlTopologyType> getListOfCreatedVlTopologyType() {
        return this.listOfCreatedVlTopologyType;
    }

    public void setListOfCreatedVlTopologyType(List<VlTopologyType> listOfCreatedVlTopologyType) {
        this.listOfCreatedVlTopologyType = listOfCreatedVlTopologyType;
    }

    public List<Report> getListOfCreatedReport() {
        if (this.listOfCreatedReport != null) {
            return this.listOfCreatedReport.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<Report> getListOfCreatedReportWithDeleted() {
        return this.listOfCreatedReport;
    }

    public void setListOfCreatedReport(List<Report> listOfCreatedReport) {
        this.listOfCreatedReport = listOfCreatedReport;
    }

    public List<Domains> getListOfCreatedDomains() {
        return this.listOfCreatedDomains;
    }

    public void setListOfCreatedDomains(List<Domains> listOfCreatedDomains) {
        this.listOfCreatedDomains = listOfCreatedDomains;
    }

    public List<LayerReferencesUser> getListOfModifiedLayerReferences() {
        return this.listOfModifiedLayerReferences;
    }

    public void setListOfModifiedLayerReferences(List<LayerReferencesUser> listOfModifiedLayerReferences) {
        this.listOfModifiedLayerReferences = listOfModifiedLayerReferences;
    }

    public List<Workorder> getListOfModifiedWorkorder() {
        if (this.listOfModifiedWorkorder != null) {
            return this.listOfModifiedWorkorder.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<Workorder> getListOfModifiedWorkorderWithDeleted() {
        return this.listOfModifiedWorkorder;
    }

    public void setListOfModifiedWorkorder(List<Workorder> listOfModifiedWorkorder) {
        this.listOfModifiedWorkorder = listOfModifiedWorkorder;
    }

    public List<FormTemplateCustom> getListOfModifiedFormTemplateCustom() {
        if (this.listOfModifiedFormTemplateCustom != null) {
            return this.listOfModifiedFormTemplateCustom.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<FormTemplateCustom> getListOfModifiedFormTemplateCustomWithDeleted() {
        return this.listOfModifiedFormTemplateCustom;
    }

    public void setListOfModifiedFormTemplateCustom(List<FormTemplateCustom> listOfModifiedFormTemplateCustom) {
        this.listOfModifiedFormTemplateCustom = listOfModifiedFormTemplateCustom;
    }

    public List<Layer> getListOfModifiedLayer() {
        return this.listOfModifiedLayer;
    }

    public void setListOfModifiedLayer(List<Layer> listOfModifiedLayer) {
        this.listOfModifiedLayer = listOfModifiedLayer;
    }

    public List<LayerReferencesUser> getListOfCreatedLayerReferences() {
        return this.listOfCreatedLayerReferences;
    }

    public void setListOfCreatedLayerReferences(List<LayerReferencesUser> listOfCreatedLayerReferences) {
        this.listOfCreatedLayerReferences = listOfCreatedLayerReferences;
    }

    public List<Workorder> getListOfCreatedWorkorder() {
        if (this.listOfCreatedWorkorder != null) {
            return this.listOfCreatedWorkorder.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<Workorder> getListOfCreatedWorkorderWithDeleted() {
        return this.listOfCreatedWorkorder;
    }

    public void setListOfCreatedWorkorder(List<Workorder> listOfCreatedWorkorder) {
        this.listOfCreatedWorkorder = listOfCreatedWorkorder;
    }

    public List<FormTemplateCustom> getListOfCreatedFormTemplateCustom() {
        if (this.listOfCreatedFormTemplateCustom != null) {
            return this.listOfCreatedFormTemplateCustom.stream()
                .filter(e -> e.getDeletedAt() == null)
                .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }
    }

    public List<FormTemplateCustom> getListOfCreatedFormTemplateCustomWithDeleted() {
        return this.listOfCreatedFormTemplateCustom;
    }

    public void setListOfCreatedFormTemplateCustom(List<FormTemplateCustom> listOfCreatedFormTemplateCustom) {
        this.listOfCreatedFormTemplateCustom = listOfCreatedFormTemplateCustom;
    }

    public List<Layer> getListOfCreatedLayer() {
        return this.listOfCreatedLayer;
    }

    public void setListOfCreatedLayer(List<Layer> listOfCreatedLayer) {
        this.listOfCreatedLayer = listOfCreatedLayer;
    }

    public Users getModifiedBy() {
        return this.modifiedBy;
    }

    public void setModifiedBy(Users modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

}
