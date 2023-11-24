package com.veolia.nextcanope.dto.itv;

import java.util.List;

public class ItvVersionFieldDto {
    private String code;
    private String label;
    private String parent;
    private String type;
    private List<ItvVersionEnumDto> listItvVersionEnum;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getParent() {
        return parent;
    }

    public void setParent(String parent) {
        this.parent = parent;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<ItvVersionEnumDto> getListItvVersionEnum() {
        return listItvVersionEnum;
    }

    public void setListItvVersionEnum(List<ItvVersionEnumDto> listItvVersionEnum) {
        this.listItvVersionEnum = listItvVersionEnum;
    }
}
