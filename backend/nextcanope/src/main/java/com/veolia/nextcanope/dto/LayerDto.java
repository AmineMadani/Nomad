package com.veolia.nextcanope.dto;

import com.veolia.nextcanope.model.Layer;

public class LayerDto {
    private Long id;
    private Integer lyrNumOrder;
    private Long domId;
    private String domLLabel;
    private String domCode;
    private Long astId;
    private String astCode;
    private String astGeomType;
    private String lyrTableName;
    private String lyrGeomColumnName;
    private String lyrUuidColumnName;
    private String lyrGeomSrid;
    private String lyrSlabel;
    private String lyrLlabel;
    private Boolean lyrDisplay;
    private Boolean lyrValid;

    public LayerDto(Layer layer) {
        this.id = layer.getId();
        this.lyrNumOrder = layer.getLyrNumOrder();
        if (layer.getDomains() != null) {
            this.domId = layer.getDomains().getId();
            this.domCode = layer.getDomains().getDomType();
            this.domLLabel = layer.getDomains().getDomLlabel();
        }

        if (layer.getAssetType() != null) {
            this.astId = layer.getAssetType().getId();
            this.astCode = layer.getAssetType().getAstCode();
            this.astGeomType = layer.getAssetType().getAstGeomType();
        }
        this.lyrTableName = layer.getLyrTableName();
        this.lyrGeomColumnName = layer.getLyrGeomColumnName();
        this.lyrUuidColumnName = layer.getLyrUuidColumnName();
        this.lyrGeomSrid = layer.getLyrGeomSrid();
        this.lyrSlabel = layer.getLyrSlabel();
        this.lyrLlabel = layer.getLyrLlabel();
        this.lyrDisplay = layer.getLyrDisplay();
        this.lyrValid = layer.getLyrValid();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getLyrNumOrder() {
        return lyrNumOrder;
    }

    public void setLyrNumOrder(Integer lyrNumOrder) {
        this.lyrNumOrder = lyrNumOrder;
    }

    public Long getDomId() {
        return domId;
    }

    public void setDomId(Long domId) {
        this.domId = domId;
    }

    public Long getAstId() {
        return astId;
    }

    public void setAstId(Long astId) {
        this.astId = astId;
    }

    public String getAstCode() {
        return astCode;
    }

    public void setAstCode(String astCode) {
        this.astCode = astCode;
    }

    public String getAstGeomType() {
        return astGeomType;
    }

    public void setAstGeomType(String astGeomType) {
        this.astGeomType = astGeomType;
    }

    public String getLyrTableName() {
        return lyrTableName;
    }

    public void setLyrTableName(String lyrTableName) {
        this.lyrTableName = lyrTableName;
    }

    public String getLyrGeomColumnName() {
        return lyrGeomColumnName;
    }

    public void setLyrGeomColumnName(String lyrGeomColumnName) {
        this.lyrGeomColumnName = lyrGeomColumnName;
    }

    public String getLyrUuidColumnName() {
        return lyrUuidColumnName;
    }

    public void setLyrUuidColumnName(String lyrUuidColumnName) {
        this.lyrUuidColumnName = lyrUuidColumnName;
    }

    public String getLyrGeomSrid() {
        return lyrGeomSrid;
    }

    public void setLyrGeomSrid(String lyrGeomSrid) {
        this.lyrGeomSrid = lyrGeomSrid;
    }

    public String getLyrSlabel() {
        return lyrSlabel;
    }

    public void setLyrSlabel(String lyrSlabel) {
        this.lyrSlabel = lyrSlabel;
    }

    public String getLyrLlabel() {
        return lyrLlabel;
    }

    public void setLyrLlabel(String lyrLlabel) {
        this.lyrLlabel = lyrLlabel;
    }

    public Boolean getLyrDisplay() {
        return lyrDisplay;
    }

    public void setLyrDisplay(Boolean lyrDisplay) {
        this.lyrDisplay = lyrDisplay;
    }

    public Boolean getLyrValid() {
        return lyrValid;
    }

    public void setLyrValid(Boolean lyrValid) {
        this.lyrValid = lyrValid;
    }

    public String getDomLLabel() {
        return domLLabel;
    }

    public void setDomLLabel(String domLLabel) {
        this.domLLabel = domLLabel;
    }

    public String getDomCode() {
        return domCode;
    }

    public void setDomCode(String domCode) {
        this.domCode = domCode;
    }
}
