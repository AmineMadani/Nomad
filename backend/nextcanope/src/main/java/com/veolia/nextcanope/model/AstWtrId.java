/*
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;


/**
 * Composite primary key for entity "AstWtr" ( stored in table "ast_wtr" )
 *
 * @author Telosys
 *
 */
public class AstWtrId implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY KEY ATTRIBUTES
    private AssetType assetType;
    private WorkorderTaskReason workorderTaskReason;
    /**
     * Constructor
     */
    public AstWtrId() {
        super();
    }

    public AstWtrId(
        AssetType assetType,
        WorkorderTaskReason workorderTaskReason
    ) {
        super();
        this.assetType = assetType ;
        this.workorderTaskReason = workorderTaskReason ;
    }
    
    //--- GETTERS & SETTERS FOR KEY FIELDS
    public AssetType getAssetType() {
        return this.assetType;
    }

    public void setAssetType(AssetType assetType) {
        this.assetType = assetType;
    }

    public WorkorderTaskReason getWorkorderTaskReason() {
        return this.workorderTaskReason;
    }

    public void setWorkorderTaskReason(WorkorderTaskReason workorderTaskReason) {
        this.workorderTaskReason = workorderTaskReason;
    }

}
