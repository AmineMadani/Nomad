package com.veolia.nextcanope.dto;

import com.veolia.nextcanope.model.LayerGrpAction;

import java.util.List;

public class LayerGrpActionDTO {
    private Long grpId;

    private String wtrCode;

    private List<String> lyrTableNames;

    public LayerGrpActionDTO(Long grpId, String wtrCode, List<String> lyrTableNames) {
        this.grpId = grpId;
        this.wtrCode = wtrCode;
        this.lyrTableNames = lyrTableNames;
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
}
