package com.veolia.nextcanope.dto.itv;

import java.util.List;

public class ExportItvParamDto {
    private List<AssetDto> listAsset;
    private String fileType;

    public List<AssetDto> getListAsset() {
        return listAsset;
    }

    public void setListAsset(List<AssetDto> listAsset) {
        this.listAsset = listAsset;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }
}
