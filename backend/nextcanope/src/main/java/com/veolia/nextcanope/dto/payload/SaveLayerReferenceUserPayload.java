package com.veolia.nextcanope.dto.payload;

import com.veolia.nextcanope.dto.LayerReference.LayerReferenceUserDto;

import java.util.List;

public class SaveLayerReferenceUserPayload {
    public SaveLayerReferenceUserPayload() {
    }

    private List<Long> userIds;
    private List<LayerReferenceUserDto> layerReferences;

    public List<Long> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<Long> userIds) {
        this.userIds = userIds;
    }

    public List<LayerReferenceUserDto> getLayerReferences() {
        return layerReferences;
    }

    public void setLayerReferences(List<LayerReferenceUserDto> layerReferences) {
        this.layerReferences = layerReferences;
    }
}
