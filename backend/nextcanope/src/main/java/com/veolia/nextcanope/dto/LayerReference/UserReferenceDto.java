package com.veolia.nextcanope.dto.LayerReference;

public class UserReferenceDto implements UserReferenceBaseDto {
    public UserReferenceDto(Integer referenceId, String referenceKey, String alias, String displayType, Integer position, Boolean isVisible, String section) {
        this.referenceId = referenceId;
        this.referenceKey = referenceKey;
        this.alias = alias;
        this.displayType = displayType;
        this.position = position;
        this.isVisible = isVisible;
        this.section = section;
    }

    private Integer referenceId;
    private String referenceKey;
    private String alias;
    private String displayType;
    private Integer position;
    private Boolean isVisible;
    private String section;

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

    public Boolean getIsVisible() {
        return isVisible;
    }

    public void setIsVisible(Boolean isVisible) {
        this.isVisible = isVisible;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }
}
