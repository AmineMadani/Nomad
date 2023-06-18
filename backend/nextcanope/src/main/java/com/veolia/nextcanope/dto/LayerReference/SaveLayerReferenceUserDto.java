package com.veolia.nextcanope.dto.LayerReference;

import java.util.List;

public class SaveLayerReferenceUserDto {
    public SaveLayerReferenceUserDto() {
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
