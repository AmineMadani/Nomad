package com.veolia.nextcanope.dto;

import java.util.List;

public class LayerGrpActionDTO {
    private Long grpId;

    private String wtrCode;

    private List<String> lyrTableNames;

    private String grpLabel;

    public LayerGrpActionDTO(Long grpId, String wtrCode, List<String> lyrTableNames, String grpLabel) {
        this.grpId = grpId;
        this.wtrCode = wtrCode;
        this.lyrTableNames = lyrTableNames;
        this.grpLabel = grpLabel;
    }

    public Long getGrpId() {
        return grpId;
    }

    public void setGrpId(Long grpId) {
        this.grpId = grpId;
    }

    public String getWtrCode() {
        return wtrCode;
    }

    public void setWtrCode(String wtrCode) {
        this.wtrCode = wtrCode;
    }

    public List<String> getLyrTableNames() {
        return lyrTableNames;
    }

    public void setLyrTableNames(List<String> lyrTableNames) {
        this.lyrTableNames = lyrTableNames;
    }

    public String getGrpLabel() {
        return grpLabel;
    }

    public void setGrpLabel(String grpLabel) {
        this.grpLabel = grpLabel;
    }
}
