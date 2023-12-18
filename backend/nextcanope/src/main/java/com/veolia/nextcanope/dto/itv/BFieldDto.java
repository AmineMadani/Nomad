package com.veolia.nextcanope.dto.itv;

import java.util.Map;

public class BFieldDto {
    private String code;
    private Map<String, String> mapAssetFieldByLayer;

    public BFieldDto(String code, Map<String, String> mapAssetFieldByLayer) {
        this.code = code;
        this.mapAssetFieldByLayer = mapAssetFieldByLayer;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Map<String, String> getMapAssetFieldByLayer() {
        return mapAssetFieldByLayer;
    }

    public void setMapAssetFieldByLayer(Map<String, String> mapAssetFieldByLayer) {
        this.mapAssetFieldByLayer = mapAssetFieldByLayer;
    }
}
