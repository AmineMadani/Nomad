package com.veolia.nextcanope.dto.itv;

import java.util.List;

public class ItvVersionDto {
    private String version;
    private List<ItvVersionFieldDto> listItvVersionField;

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public List<ItvVersionFieldDto> getListItvVersionField() {
        return listItvVersionField;
    }

    public void setListItvVersionField(List<ItvVersionFieldDto> listItvVersionField) {
        this.listItvVersionField = listItvVersionField;
    }
}
