package com.veolia.nextcanope.dto.LayerReference;

import java.util.List;

public class LayerReferencesDto {
    private String layerKey;
    private List<UserReferenceDto> references;

    public String getLayerKey() {
        return layerKey;
    }

    public void setLayerKey(String layerKey) {
        this.layerKey = layerKey;
    }

    public List<UserReferenceDto> getReferences() {
        return references;
    }

    public void setReferences(List<UserReferenceDto> references) {
        this.references = references;
    }
}
