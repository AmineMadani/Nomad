package com.veolia.nextcanope.dto.payload;

import com.veolia.nextcanope.dto.ImageDto;
import com.veolia.nextcanope.model.LayerStyle;
import com.veolia.nextcanope.model.StyleImage;

import java.util.ArrayList;
import java.util.List;

public class UpdateLayerStylePayload {
    private Long lseId;
    private String lseCode;

    private Long sydId;
    private String sydDefinition;

    private List<ImageDto> listImage = new ArrayList<ImageDto>();

    public UpdateLayerStylePayload() {
    }

    public Long getLseId() {
        return lseId;
    }

    public void setLseId(Long lseId) {
        this.lseId = lseId;
    }

    public String getLseCode() {
        return lseCode;
    }

    public void setLseCode(String lseCode) {
        this.lseCode = lseCode;
    }

    public String getSydDefinition() {
        return sydDefinition;
    }

    public void setSydDefinition(String sydDefinition) {
        this.sydDefinition = sydDefinition;
    }

    public List<ImageDto> getListImage() {
        return listImage;
    }

    public void setListImage(List<ImageDto> listImage) {
        this.listImage = listImage;
    }

    public Long getSydId() {
        return sydId;
    }

    public void setSydId(Long sydId) {
        this.sydId = sydId;
    }
}
