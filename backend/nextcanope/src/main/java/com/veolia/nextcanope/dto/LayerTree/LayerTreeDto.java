package com.veolia.nextcanope.dto.LayerTree;

import com.veolia.nextcanope.dto.LayerReference.LayerReferenceUserDto;

import java.util.List;

public class LayerTreeDto {
    private String layerKey;
    private List<LayerReferenceUserDto> references;

    public String getLayerKey() {
        return layerKey;
    }

    public void setLayerKey(String layerKey) {
        this.layerKey = layerKey;
    }

    public List<LayerReferenceUserDto> getReferences() {
        return references;
    }

    public void setReferences(List<LayerReferenceUserDto> references) {
        this.references = references;
    }
}
