package com.veolia.nextcanope.dto.payload;

import com.veolia.nextcanope.dto.LayerStyle.StyleImageDto;

import java.util.ArrayList;
import java.util.List;

public class SaveLayerStylePayload {
    private String lseCode;
    private String sydDefinition;
    private List<StyleImageDto> listImage = new ArrayList<>();

    public SaveLayerStylePayload() {
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

    public List<StyleImageDto> getListImage() {
        return listImage;
    }

    public void setListImage(List<StyleImageDto> listImage) {
        this.listImage = listImage;
    }
}
