package com.veolia.nextcanope.dto.LayerTree;

import com.veolia.nextcanope.dto.LayerReference.UserReferenceDto;

import java.util.List;

public class LayerTreeDto {
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
