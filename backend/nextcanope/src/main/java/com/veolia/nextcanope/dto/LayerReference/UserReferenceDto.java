package com.veolia.nextcanope.dto.LayerReference;

public class UserReferenceDto {
    public UserReferenceDto(Integer referenceId, String referenceKey, String alias, String displayType, Integer position) {
        this.referenceId = referenceId;
        this.referenceKey = referenceKey;
        this.alias = alias;
        this.displayType = displayType;
        this.position = position;
    }

    private Integer referenceId;
    private String referenceKey;
    private String alias;
    private String displayType;
    private Integer position;

    public Integer getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Integer referenceId) {
        this.referenceId = referenceId;
    }

    public String getReferenceKey() {
        return referenceKey;
    }

    public void setReferenceKey(String referenceKey) {
        this.referenceKey = referenceKey;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public String getDisplayType() {
        return displayType;
    }

    public void setDisplayType(String displayType) {
        this.displayType = displayType;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }
}
